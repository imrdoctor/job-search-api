import * as DBS from "../../DB/dbService.js";
import applicationModel, { APPLICATION_STATUS } from "../../DB/models/application/application.model.js";
import chatModel from "../../DB/models/chat/chat.model.js";
import companyModel from "../../DB/models/company/company.model.js";
import jobModel from "../../DB/models/job/job.model.js";
import userModel, { defaultavatars, defaultRoles } from "../../DB/models/user/user.model.js";
import { asyncHandler } from "../../utils/utils.js";
import chalk from 'chalk';

import { connectionUser } from '../../DB/models/user/user.model.js';

import { authorizationSocketIo } from '../../middleware/auth.js';

export const getChatUsers = asyncHandler(async (req, res, next) => {
    const user = req.user
    const userCompanys = await DBS.find(
        {
            model : companyModel,
            filter:{
                $or: [
                    { createdBy: req.user._id },  // إذا كان المستخدم Owner
                    { HRs: req.user._id }         // إذا كان المستخدم HR
                ]
            }
        }
    );
    const companyIds = userCompanys.map(company => company._id); 
    const jobs = await DBS.find({
        model: jobModel,
        filter: {
            companyId: { $in: companyIds }  
        },
    });
    const jobIds = jobs.map(job => job._id.toString());
    const applications = await DBS.find({
        model: applicationModel,
        filter: {
            jobId: { $in: jobIds }, 
            status: "accepted"     
        },
        populate: {
            path: "userId", 
            select: "firstName lastName email phone gender profilePic" 
        }
    });    

    const acceptedUsers = applications.map(app => app.userId);
    const chats = await DBS.find({
        model: chatModel,
        filter: {
            $or: [
                { senderId: req.user._id },
                { receiverId: req.user._id }
            ]
        },
        populate: [
            { path: "senderId", select: "firstName lastName email phone gender profilePic" },
            { path: "receiverId", select: "firstName lastName email phone gender profilePic" }
        ]
    });
    const chatUsers = chats.flatMap(chat => [chat.senderId, chat.receiverId]);
    const allUsers = [...acceptedUsers, ...chatUsers];
    const users = Array.from(new Map(allUsers.map(user => [user._id.toString(), user])).values());

    return res.json({ message: "Users found", data: users });
    
});


export function mainIo(io) {
    io.on("connection", async (socket) => {
        const auth = socket.handshake.auth;
        const result = await authorizationSocketIo(auth);

        if (result.statusCode !== 200) {
            console.log(chalk.red(`❌ Connection refused: ${result.message}`));
            return socket.disconnect();
        }

        const user = result.user;
        connectionUser.set(socket.id, user._id);

        console.log(chalk.green("🟢 User connected: " + socket.id));

        // 🟢 **الاستماع إلى الرسائل**
        socket.on("sendMessage", async (data) => {
            try {
                const { text, senderId, senderName, receiverId } = data;

                // ✅ **حفظ الرسالة في قاعدة البيانات**
                let chat = await chatModel.findOne({
                    $or: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                });

                if (!chat) {
                    chat = new chatModel({ senderId, receiverId, messages: [] });
                }

                const newMessage = { senderId, message: text };
                chat.messages.push(newMessage);
                await chat.save();

                // ✅ **إرسال الرسالة للمستلم إذا كان متصلًا**
                const receiverSocketId = [...connectionUser.entries()]
                    .find(([_, id]) => id.toString() === receiverId)?.[0];

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receiveMessage", {
                        text,
                        senderId,
                        senderName,
                        receiverId
                    });
                }

                console.log(chalk.blue(`📩 Message sent from ${senderId} to ${receiverId}: "${text}"`));
            } catch (error) {
                console.error(chalk.red("❌ Error saving message:"), error);
            }
        });

        // 🛑 **التعامل مع قطع الاتصال**
        socket.on("disconnect", () => {
            console.log(chalk.red("🔴 User disconnected: " + socket.id));
            connectionUser.delete(socket.id);
        });
    });
}

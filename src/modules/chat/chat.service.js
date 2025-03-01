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
    const userId = req.user._id;

    const userCompanys = await DBS.find({
        model: companyModel,
        filter: {
            $or: [
                { createdBy: userId },
                { HRs: userId }
            ]
        }
    });

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
                { senderId: userId },
                { receiverId: userId }
            ]
        },
        populate: [
            { path: "senderId", select: "firstName lastName email phone gender profilePic" },
            { path: "receiverId", select: "firstName lastName email phone gender profilePic" }
        ]
    });

    const chatUsers = chats.flatMap(chat => [chat.senderId, chat.receiverId]);

    const allUsers = [...acceptedUsers, ...chatUsers];

    const users = Array.from(new Map(
        allUsers
            .filter(user => user._id.toString() !== userId.toString())
            .map(user => [user._id.toString(), user])
    ).values());

    return res.json({ message: "Users found", data: users });
});

export const getChatHistory = asyncHandler(async (req, res, next) => {
    const { receiverId } = req.params;
    const senderId = req.user._id; 
    if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID is required." });
    }

    const chat = await chatModel.findOne({
        $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
        ]
    }).populate([
        { path: "senderId", select: "firstName lastName profilePic" },
        { path: "receiverId", select: "firstName lastName profilePic" }
    ]);

    if (!chat) {
        return res.status(200).json({ message: "No chat history found.", messages: [] });
    }

    return res.status(200).json({ message: "Chat history retrieved.", messages: chat.messages });
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

        socket.on("sendMessage", async (data) => {
            try {
                const { text, senderId, senderName, receiverId } = data;
        
                if (!senderId) {
                    console.error("❌ senderId is missing in sendMessage event");
                    return;
                }
        
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
        
                console.log(`📩 Message sent from ${senderId} to ${receiverId}: "${text}"`);
            } catch (error) {
                console.error("❌ Error saving message:", error);
            }
        });
        

        socket.on("disconnect", () => {
            console.log(chalk.red("🔴 User disconnected: " + socket.id));
            connectionUser.delete(socket.id);
        });
    });
}

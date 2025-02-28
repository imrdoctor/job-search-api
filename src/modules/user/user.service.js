import { create } from "../../DB/dbService.js";
import * as DBS from "../../DB/dbService.js";
import userModel, { defaultavatars, defaultGenders, defaultproviders, defaultRoles, otpTyps, verfyTypes } from "../../DB/models/user/user.model.js";
import cloudinary from "../../utils/cloudinary/index.js";
import { eventEmitter, generatedCryptToken, hashCompare, verfyCryptedToken, asyncHandler, hashing } from "../../utils/utils.js";
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client();
export const signUp = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, phone, email, password, gender, birthdate, verfyType } = req.body
    const createdUser = await DBS.create({
        model: userModel,
        query: {
            firstName,
            lastName,
            phone,
            email,
            password,
            gender,
            birthdate,
            'profilePic.secure_url': gender == defaultavatars.male ? defaultavatars.male : defaultavatars.female,
            provider: defaultproviders.system
        }
    })
    const data = { email, id: createdUser._id }
    if (verfyType === verfyTypes.otp) {
        eventEmitter.emit("sendActiveEmailOTP", data);
    } else {
        eventEmitter.emit("sendActiveEmailLINK", data);
    }
    return res.status(200).json({ msg: "done", AccountName: createdUser.username, email: createdUser.email })
})
export const confirmOtp = asyncHandler(async (req, res, next) => {
    const { otp } = req.body
    const user = req.user
    if (user.isConfirmed) {
        return next(new Error(`Email already confirmed`, { cause: { status: 400 } }))

    }
    let userOtp = user.OTPs.filter(otp => otp.type === otpTyps.verfyEmailOtp)
    userOtp = userOtp[0]
    if (!userOtp) {
        return next(new Error(`No otp found`, { cause: { status: 400 } }))
    }
    if (userOtp.expiresIn.getTime() < Date.now()) {
        await DBS.findByIdAndUpdate({
            model: userModel,
            id: user._id,
            update: {
                $pull: { OTPs: { _id: userOtp._id } }
            }
        })
        return next(new Error(`Otp is expired`, { cause: { status: 400 } }))
    }
    const isMatchedOtp = await hashCompare({ current: otp, old: userOtp.code })
    if (!isMatchedOtp) {
        return next(new Error(`Invalid otp`, { cause: { status: 400 } }))
    }
    await DBS.findByIdAndUpdate({
        model: userModel,
        id: user._id,
        update: {
            isConfirmed: true,
            $pull: { OTPs: { _id: userOtp._id } }
        }
    })
    return res.status(200).json({ msg: "Email confirmed successfully" })
})
export const confirmLink = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    const originalToken = decodeURIComponent(token);
    const verfyToken = await verfyCryptedToken({ value: originalToken, sign: process.env.SIGNATURE_TOKEN_ACTIVE })
    const user = await DBS.findById(
        {
            model: userModel,
            id: verfyToken.id
        }
    )
    if (!user) {
        return next(new Error(`User not found`, { cause: { status: 400 } }))
    }
    if (user.isConfirmed) {
        return next(new Error(`Email already confirmed`, { cause: { status: 400 } }))

    }
    let userOtp = user.OTPs.filter(otp => otp.type === otpTyps.verfyEmailLink)
    userOtp = userOtp[0]
    if (!userOtp) {
        return next(new Error(`No otp found`, { cause: { status: 400 } }))
    }
    if (userOtp.expiresIn.getTime() < Date.now()) {
        await DBS.findByIdAndUpdate({
            model: userModel,
            id: user._id,
            update: {
                $pull: { OTPs: { _id: userOtp._id } }
            }
        })
        return res.status(400).json({ msg: "Otp is expired" })
    }
    const isMatchEmailLink = await hashCompare(
        { current: verfyToken.otp, old: userOtp.code }
    )
    if (!isMatchEmailLink) {
        return res.status(400).json({ msg: "Invalid link" })
    }
    await DBS.findByIdAndUpdate({
        model: userModel,
        id: user._id,
        update: {
            isConfirmed: true,
            $pull: { OTPs: { _id: userOtp._id } }
        }
    })
    return res.status(200).json({ msg: "Email confirmed successfully", username: user.username })
})
export const LoginoAuthGoogle = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.Google_Client_Id,
        });
        const { email, given_name, family_name, picture, email_verified, } = ticket.getPayload();
        if (!email_verified) {
            return next(new Error(`Email not verified`, { cause: { status: 400 } }))
        }
        let user = await DBS.findOne({
            model: userModel,
            filter: { email }
        })
        if (!user) {
            user = await DBS.create({
                model: userModel,
                query: {
                    email,
                    firstName: given_name,
                    lastName: family_name,
                    'profilePic.secure_url': picture,
                    provider: defaultproviders.google,
                    isConfirmed: email_verified,
                },
            })
        }
        if (user.provider !== defaultproviders.google) {
            return next(new Error("User already registered with another provider", { cause: { status: 409 } }));
        }
        const secret = user.tokenSecret ? user.tokenSecret : await DBS.getUserSecret({ model: userModel, user });
        const signKey = user.role === defaultRoles.user ? process.env.SIGNATURE_TOKEN_USER : process.env.SIGNATURE_TOKEN_ADMIN;
        const payload = { id: user._id, secret: secret };
        const expiresIn = process.env.TOKEN_EXPIRATION || "10d";
        const token = await generatedCryptToken({ payload, signKey, expiresIn, })
        const RefreshsignKey = user.role === defaultRoles.user ? process.env.SIGNATURE_TOKEN_USER_REFRESH : process.env.SIGNATURE_TOKEN_ADMIN_REFRESH;
        const expiresInRefresh = process.env.TOKEN_EXPIRATION_REFRESH || "3d";
        const refreshToken = await generatedCryptToken({ payload, signKey: RefreshsignKey, expiresInRefresh, })
        return res.status(200).json({
            token, refreshToken, info: {
                userId: user._id,
                username: user.username,
                gender: user.gender,
                avatar: user.profilePic.secure_url
            }
        })
    }
    await verify();
})
export const login = asyncHandler(async (req, res, next) => {
    const { password } = req.body;
    const user = req.user
    if (user.provider !== defaultproviders.system) {
        return next(new Error(`This Account Linked With Other Provider`, { cause: { status: 400 } }))
    }
    const isMatchedPassword = await hashCompare({ current: password, old: user.password })
    if (!isMatchedPassword) {
        return next(new Error(`Password Not Match`, { cause: { status: 400 } }))
    }
    const secret = user.tokenSecret ? user.tokenSecret : await DBS.getUserSecret({ model: userModel, user });
    const signKey = user.role === defaultRoles.user ? process.env.SIGNATURE_TOKEN_USER : process.env.SIGNATURE_TOKEN_ADMIN;
    console.log(signKey);
    const payload = { id: user._id, secret: secret };
    const expiresIn = process.env.TOKEN_EXPIRATION || "10d";
    const token = await generatedCryptToken({ payload, signKey, expiresIn, })
    const RefreshsignKey = user.role === defaultRoles.user ? process.env.SIGNATURE_TOKEN_USER_REFRESH : process.env.SIGNATURE_TOKEN_ADMIN_REFRESH;
    const expiresInRefresh = process.env.TOKEN_EXPIRATION_REFRESH || "3d";
    const refreshToken = await generatedCryptToken({ payload, signKey: RefreshsignKey, expiresInRefresh, })
    return res.status(200).json({
        token, refreshToken, info: {
            userId: user._id,
            username: user.username,
            gender: user.gender,
            avatar: user.profilePic.secure_url,
            role: user.role
        }
    })
})
export const ForgetPassword = asyncHandler(async (req, res, next) => {
    const user = req.user
    if (user.provider !== defaultproviders.system) {
        return next(new Error(`Cant't Reset Password To Account Linked With Other Provider`, { cause: { status: 400 } }))
    }
    let oldRequists = user.OTPs.filter(otp => otp.type === otpTyps.forgetPasswordOtp)
    oldRequists = oldRequists[0]
    if (oldRequists) {
        await DBS.findByIdAndUpdate({
            model: userModel,
            id: user._id,
            update: {
                $pull: { OTPs: { _id: oldRequists._id } }
            }
        })
    }
    const data = { id: user._id, email: user.email }
    eventEmitter.emit("forgetpasswordOTP", data);
    return res.status(200).json({ message: "code Sent to your Email" })
})
export const ForgetPasswodOtpConfirm = asyncHandler(async (req, res, next) => {
    const user = req.user
    const { otp } = req.body
    let userOtp = user.OTPs.filter(otp => otp.type === otpTyps.forgetPasswordOtp)
    userOtp = userOtp[0]
    if (!userOtp) {
        return next(new Error(`No Reset Requists Found`, { cause: { status: 400 } }))
    }
    if (userOtp.expiresIn.getTime() < Date.now()) {
        await DBS.findByIdAndUpdate({
            model: userModel,
            id: user._id,
            update: {
                $pull: { OTPs: { _id: userOtp._id } }
            }
        })
        return next(new Error(`Otp is expired`, { cause: { status: 400 } }))
    }
    const isMatchedOtp = await hashCompare({ current: otp, old: userOtp.code })
    if (!isMatchedOtp) {
        return next(new Error(`Invalid otp`, { cause: { status: 400 } }))
    }
    const secret = await DBS.getUserResetSecret({ model: userModel, user });
    const signKey = process.env.SIGNATURE_TOKEN_FORGET
    const payload = { id: user._id, secret };
    const expiresIn = process.env.TOKEN_FORGET_EXPIRE || "5m";
    const token = await generatedCryptToken({ payload, signKey, expiresIn, })
    return res.status(200).json({
        msg: "ok",
        token
    })
})
export const newResetPassword = asyncHandler(async (req, res, next) => {
    const user = req.user
    const { password } = req.body
    const saltRounds = parseInt(process.env.BYCRYPTSOLT_ROUNDS, 10);
    const hashedPassword = await hashing({ value: password, saltRounds })
    let oldRequists = user.OTPs.filter(otp => otp.type === otpTyps.forgetPasswordOtp)
    oldRequists = oldRequists[0]
    await DBS.findByIdAndUpdate({
        model: userModel,
        id: user._id,
        update: {
            $unset: { resetTokenSecret: "" },
            $pull: { OTPs: { _id: oldRequists._id } },
            $set: { password: hashedPassword }
        }
    })
    return res.status(200).json({ msg: "done", })
})
export const refreshToken = asyncHandler(async (req, res, next) => {
    const user = req.user
    const secret = await DBS.getUserSecret({ model: userModel, user });
    const signKey = user.role === defaultRoles.user ? process.env.SIGNATURE_TOKEN_USER : process.env.SIGNATURE_TOKEN_ADMIN;
    const payload = { id: user._id, secret: secret };
    const expiresIn = process.env.TOKEN_EXPIRATION || "10d";
    const token = await generatedCryptToken({ payload, signKey, expiresIn, })
    const RefreshsignKey = user.role === defaultRoles.user ? process.env.SIGNATURE_TOKEN_USER_REFRESH : process.env.SIGNATURE_TOKEN_ADMIN_REFRESH;
    const expiresInRefresh = process.env.TOKEN_EXPIRATION_REFRESH || "3d";
    const refreshToken = await generatedCryptToken({ payload, signKey: RefreshsignKey, expiresInRefresh, })
    return res.status(200).json({
        msg: "done",
        token, refreshToken, info: {
            userId: user._id,
            username: user.username,
            gender: user.gender,
            avatar: user.profilePic.secure_url
        }
    })
})
export const activeEmailSend = asyncHandler(async (req, res, next) => {
    const user = req.user
    const { verfyType } = req.body
    if (user.isConfirmed === true) {
        return next(new Error(`Your Account Alreday Confirmed`, { cause: { status: 400 } }))
    }
    if (user.provider !== defaultproviders.system) {
        return next(new Error(`UNAUTHORIZATION`, { cause: { status: 400 } }))
    }
    let oldRequists = user.OTPs.filter(otp =>
        otp.type === otpTyps.verfyEmailOtp || otp.type === otpTyps.verfyEmailLink
    );

    if (oldRequists.length > 0) {
        await DBS.findByIdAndUpdate({
            model: userModel,
            id: user._id,
            update: {
                $pull: { OTPs: { _id: { $in: oldRequists.map(otp => otp._id) } } }
            }
        });
    }
    const data = { email: user.email, id: user._id }
    if (verfyType === verfyTypes.otp) {
        eventEmitter.emit("sendActiveEmailOTP", data);
    } else {
        eventEmitter.emit("sendActiveEmailLINK", data);
    }
    return res.status(200).json({ message: "code Sent to your Email" })
})
export const getUserInfo = asyncHandler(async (req, res, next) => {
    const user = req.user
    return res.status(200).json({
        info: {
            userId: user._id,
            username: user.username,
            phone: user.phone,
            gender: user.gender,
            birthdate: user.birthdate,
            role: user.role,
            avatar: user.profilePic.secure_url,
            coverPic: user.coverPic?.secure_url ?? "not have coverPic",
        }
    })
})
export const updateInfo = asyncHandler(async (req, res, next) => {
    const user = req.user
    const updatedUser = await DBS.findByIdAndUpdate({
        model: userModel,
        id: user._id,
        update: { $set: { ...req.body } }
    })
    return res.status(200).json({
        message: "user info updated successfully",
        info: {
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            gender: updatedUser.gender,
            birthdate: updatedUser.birthdate,
            avatar: updatedUser.profilePic.secure_url,
            coverPic: user.coverPic?.secure_url ?? "not have banner",
            role: updatedUser.role
        }
    })
})
export const getUserIdInfo = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const user = await DBS.findById({
        model: userModel,
        id
    })
    if(!user){
        return res.status(404).json({ message: "user not found" })
    }    
    if (user?.deletedAt) {
        return res.status(404).json({ message: "user not found" })
    }
    return res.status(200).json({
        message: "user info",
        userInfo: {
            info: {
                user_name: user.username,
                phone: user.phone,
                avatar: user.profilePic.secure_url,
                coverPic: user.coverPic?.secure_url ?? "not have coverPic",
            }
        }
    })
})
export const updatePassword = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const { old, password } = req.body;
    const isMatchedPassword = await hashCompare({
        current: old,
        old: user.password
    })
    if (!isMatchedPassword) {
        return res.status(400).json({ message: "old password is not matched" })
    }
    const updatedUser = await DBS.findByIdAndUpdate({
        model: userModel,
        id: user._id,
        update: { $set: { password: password } }
    });
    if (updatedUser) {
        return res.status(200).json({ message: "password updated successfully" })
    }
    return res.status(400).json({ message: "password change failed" })
})
export const deleteAccount = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const deleteUser = await DBS.findByIdAndUpdate({
        model: userModel,
        id: user._id,
        update: { $set: { deletedAt: Date.now() } }
    });
    if (deleteUser) {
        return res.status(200).json({ message: "Your Account Deleted successfully" })
    }
    return res.status(400).json({ message: "failed Delete Your Account" })
})
export const uploadAvatar = asyncHandler(async (req, res, next) => {
    // The old avatar is automatically replaced since the user ID is used as public_id.
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "jobSearch/user/avatar",
        public_id: req.user._id
    })
    if (!uploaded) {
        return res.status(400).json({ message: "Failed to upload avatar" })
    }
    const updateAvatar = DBS.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        update: {
            profilePic: {
                secure_url: uploaded.secure_url,
                public_id: uploaded.public_id
            }
        }
    })
    if (!updateAvatar) {
        return res.status(400).json({ message: "Failed to update avatar" })
    }
    return res.status(200).json({ message: "Avatar uploaded successfully", newAvatar: uploaded.secure_url })
})
export const uploadCover = asyncHandler(async (req, res, next) => {
    console.log(req.file)

    // The old cover is automatically replaced since the user ID is used as public_id.
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "jobSearch/user/cover",
        public_id: req.user._id
    })
    if (!uploaded) {
        return res.status(400).json({ message: "Failed to upload cover" })
    }
    const updateCover = DBS.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        update: {
            $set: {
                "coverPic.secure_url": uploaded.secure_url,
                "coverPic.public_id": uploaded.public_id
            }
        }
    })
    if (!updateCover) {
        return res.status(400).json({ message: "Failed to update cover" })
    }
    return res.status(200).json({
        message: "Cover uploaded successfully",
        newCover: uploaded.secure_url 
    })
})
export const deleteAvatar = asyncHandler(async (req, res, next) => {
    const user = req.user
    if (!user || !user.profilePic?.public_id) {
        return res.status(400).json({ message: "No avatar found to delete" });
    }

    const deleted = await cloudinary.uploader.destroy(user.profilePic.public_id);
    if (deleted.result !== "ok") {
        return res.status(400).json({ message: "Failed to delete avatar" });
    }
    const defaultAvatar = user.gender === defaultGenders.male ? defaultavatars.male : defaultavatars.female
    const updateUser = await DBS.findByIdAndUpdate({
        model: userModel,
        id: user._id,
        update: {
            $set: {
                "profilePic.secure_url": defaultAvatar,
            },
            $unset: {
                "profilePic.public_id": defaultAvatar,
            },
        },
    })
    if (!updateUser) {
        return res.status(400).json({ message: "Failed to delete user avatar" });
    }
    return res.status(200).json({ message: "Avatar deleted successfully" });
})
export const deleteCover = asyncHandler(async (req, res, next) => {
    const user = req.user;
    if (!user || !user.coverPic?.public_id) {
        return res.status(400).json({ message: "No cover photo found to delete" });
    }

    const deleted = await cloudinary.uploader.destroy(user.coverPic.public_id);
    if (deleted.result !== "ok") {
        return res.status(400).json({ message: "Failed to delete cover photo" });
    }

    const updateUser = await DBS.findByIdAndUpdate({
        model: userModel,
        id: user._id,
        update: {
            $unset: { "coverPic": "" }
        },
    });

    if (!updateUser) {
        return res.status(400).json({ message: "Failed to delete user cover" });
    }
    return res.status(200).json({ message: "Cover photo deleted successfully" });
})

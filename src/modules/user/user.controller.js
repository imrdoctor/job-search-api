import { Router } from "express";
import * as US from "./user.service.js";
import * as UV from "./user.validations.js";
import { validation } from "../../middleware/validation.js";
import * as ATH from "../../middleware/auth.js";
import { fileTypes, multerCloud, multerLocal } from "../../middleware/multer.js";

const userController = Router();
userController.post(
    '/signup',
    validation(UV.signUpSchema),
    ATH.findEmail("unique"),
    US.signUp
);

userController.post(
    '/loginWithGmail',
    validation(UV.signGogaleSchema),
    ATH.findEmail("unique"),
    US.LoginoAuthGoogle
);

userController.post(
    '/confirmotp',
    validation(UV.confirmOtpSchema),
    ATH.findEmail("exists"),
    US.confirmOtp
);

userController.get(
    '/actve/:token',
    validation(UV.confirmLinkSchema),
    US.confirmLink
);

userController.post(
    '/login',
    validation(UV.LoginSchema),
    ATH.findEmail("exists"),
    US.login
);

userController.post(
    '/forget-password',
    validation(UV.ForgetPasswordSchema),
    ATH.findEmail("exists"),
    US.ForgetPassword
);

userController.post(
    '/forget-password-otp',
    validation(UV.confirmOtpSchema),
    ATH.findEmail("exists"),
    US.ForgetPasswodOtpConfirm
);

userController.patch(
    '/reset-password',
    validation(UV.newResetPasswordSchema),
    ATH.ForgetPasswordAuth(),
    US.newResetPassword
);

userController.post(
    '/refresh-token',
    validation(UV.tokenHeaderSchema),
    ATH.refreshTokenAuth(),
    US.refreshToken
);

userController.post(
    '/send-active-email',
    validation(UV.sendActiveEmailSchema),
    ATH.authorization(),
    US.activeEmailSend
);

userController.get(
    '/user-info',
    validation(UV.tokenHeaderSchema),
    ATH.authorization(),
    US.getUserInfo
);
userController.get(
    '/user-info/:id',
    validation(UV.tokenHeaderSchema),
    ATH.authorization(),
    US.getUserIdInfo
);
userController.patch(
    '/update',
    validation(UV.getUserInfoSchema),
    ATH.authorization(),
    US.updateInfo
);
userController.patch(
    '/update-password',
    validation(UV.updatePasswordSchema),
    ATH.authorization(),
    US.updatePassword
);
userController.delete(
    '/delete',
    validation(UV.tokenHeaderSchema),
    ATH.authorization(),
    US.deleteAccount
);
userController.post(
    '/change-avatar',
    ATH.authorization(),
    multerCloud(
        [...fileTypes.image, ...fileTypes.animatedImage],
        3 * 1024 * 1024
    ).single('avatar'),
    validation(UV.updateProfileImgs),
    US.uploadAvatar
)
userController.post(
    '/change-cover',
    ATH.authorization(),
    multerCloud(
        [...fileTypes.image, ...fileTypes.animatedImage],
        3 * 1024 * 1024
    ).single('cover'),
    validation(UV.updateProfileImgs),
    US.uploadCover
)
userController.delete(
    '/delete-avatar',
    validation(UV.tokenHeaderSchema),
    ATH.authorization(),
    US.deleteAvatar
)
userController.delete(
    '/delete-cover',
    validation(UV.tokenHeaderSchema),
    ATH.authorization(),
    US.deleteCover
)
export default userController;
import joi from "joi";
import { genralRules } from "../../utils/utils.js";
import { verfyTypes } from "../../DB/models/user/user.model.js";
export const signUpSchema = {
    body: joi.object({
        firstName: genralRules.firstName.required().messages({
            "any.required": "First name is required.",
            "string.empty": "First name cannot be empty."
        }),
        lastName: genralRules.lastName.required().messages({
            "any.required": "Last name is required.",
            "string.empty": "Last name cannot be empty."
        }),
        email: genralRules.email.required().messages({
            "any.required": "Email is required.",
            "string.empty": "Email cannot be empty."
        }),
        password: genralRules.password.required().messages({
            "any.required": "Password is required.",
            "string.empty": "Password cannot be empty."
        }),
        Repassword: genralRules.Repassword.required().messages({
            "any.required": "Password confirmation is required.",
            "string.empty": "Password confirmation cannot be empty."
        }),
        gender: genralRules.gender.required().messages({
            "any.required": "Gender is required.",
            "string.empty": "Gender cannot be empty."
        }),
        birthdate: genralRules.birthdate.required().messages({
            "any.required": "Birthdate is required.",
            "date.base": "Invalid birthdate format.",
            "string.empty": "Birthdate cannot be empty."
        }),
        phone: genralRules.phone.required().messages({
            "any.required": "Phone number is required.",
            "string.empty": "Phone number cannot be empty."
        }),
        verfyType: genralRules.verfyType.required().messages({
            "any.only": "verfyType must be either 'link' or 'otp'",
            "string.base": "verfyType must be a string",
            "any.required": "verfyType is required"
        })
    })
}
export const signGogaleSchema = {
    body: joi.object({
        idToken: genralRules.idToken.required().messages({
            "any.required": "First name is required.",
            "string.empty": "First name cannot be empty."
        }),
    })
}
export const confirmOtpSchema = {
    body: joi.object({
        email: genralRules.email.required().messages({
            "any.required": "Email is required.",
            "string.empty": "Email cannot be empty."
        }),
        otp: genralRules.otp.required().messages({
            "any.required": "OTP is required.",
            "string.empty": "OTP cannot be empty."
        })
    })
}
export const confirmLinkSchema = {
    params: joi.object({
        token: genralRules.authorization.required().messages({
            "any.required": "OTP is required.",
            "string.empty": "OTP cannot be empty."
        })
    })
}
export const LoginSchema = {
    body: joi.object({
        email: genralRules.email.required().messages({
            "any.required": "Email is required.",
            "string.empty": "Email cannot be empty."
        }),
        password: genralRules.password.required().messages({
            "any.required": "Password is required.",
            "string.empty": "Password cannot be empty."
        }),
    })
}
export const ForgetPasswordSchema = {
    body: joi.object({
        email: genralRules.email.required().messages({
            "any.required": "Email is required.",
            "string.empty": "Email cannot be empty."
        }),
    })
}
export const newResetPasswordSchema = {
    body: joi.object({
        password: genralRules.password.required().messages({
            "any.required": "Password is required.",
            "string.empty": "Password cannot be empty."
        }),
        Repassword: genralRules.Repassword.required().messages({
            "any.required": "Password confirmation is required.",
            "string.empty": "Password confirmation cannot be empty."
        }),
    }),
    headers: joi.object({
        authorization: joi.string().required().messages({
            "any.required": "Authorization header is required.",
        }),
        "content-type": joi.string().optional(),
        "user-agent": joi.string().optional(),
        accept: joi.string().optional(),
        "cache-control": joi.string().optional(),
        "postman-token": joi.string().optional(),
        host: joi.string().optional(),
        "accept-encoding": joi.string().optional(),
        connection: joi.string().optional(),
        "content-length": joi.string().optional(),
    }).unknown(false),
}
export const tokenHeaderSchema = {
    headers: joi.object({
        authorization: genralRules.authorization.required().messages({
            "any.required": "Authorization header is required.",
        }),
        authtype: genralRules.authType.required().messages({
            "any.required": "authType is required.",
        }),
        "content-type": joi.string().optional(),
        "user-agent": joi.string().optional(),
        accept: joi.string().optional(),
        "cache-control": joi.string().optional(),
        "postman-token": joi.string().optional(),
        host: joi.string().optional(),
        "accept-encoding": joi.string().optional(),
        connection: joi.string().optional(),
        "content-length": joi.string().optional(),
    }).unknown(false),
}
export const getUserInfoSchema = {
    body:joi.object({
        id: genralRules.ObjectId.required().messages({
            "any.required": "id is required.",
        })
    }),
    headers: joi.object({
        authorization: genralRules.authorization.required().messages({
            "any.required": "Authorization header is required.",
        }),
        authtype: genralRules.authType.required().messages({
            "any.required": "authType is required.",
        }),
        "content-type": joi.string().optional(),
        "user-agent": joi.string().optional(),
        accept: joi.string().optional(),
        "cache-control": joi.string().optional(),
        "postman-token": joi.string().optional(),
        host: joi.string().optional(),
        "accept-encoding": joi.string().optional(),
        connection: joi.string().optional(),
        "content-length": joi.string().optional(),
    }).unknown(false),
}
export const sendActiveEmailSchema = {
    body: joi.object({
        verfyType: genralRules.verfyType.required().messages({
            "any.only": "verfyType must be either 'link' or 'otp'",
            "string.base": "verfyType must be a string",
            "any.required": "verfyType is required"
        })
    }),
    headers: joi.object({
        authorization: genralRules.authorization.required().messages({
            "any.required": "Authorization header is required.",
        }),
        authtype: genralRules.authType.required().messages({
            "any.required": "authType is required.",
        }),
        "content-type": joi.string().optional(),
        "user-agent": joi.string().optional(),
        accept: joi.string().optional(),
        "cache-control": joi.string().optional(),
        "postman-token": joi.string().optional(),
        host: joi.string().optional(),
        "accept-encoding": joi.string().optional(),
        connection: joi.string().optional(),
        "content-length": joi.string().optional(),
    }).unknown(false),
}

// firstName, lastName, gender, phone, birthdate

export const updateInfoSchema = {
    body: joi.object({
        firstName: genralRules.firstName.messages({
            "string.empty": "First name cannot be empty."
        }),
        lastName: genralRules.lastName.messages({
            "string.empty": "Last name cannot be empty."
        }),
        gender: genralRules.gender.messages({
            "string.empty": "Gender cannot be empty."
        }),
        birthdate: genralRules.birthdate.messages({
            "date.base": "Invalid birthdate format.",
            "string.empty": "Birthdate cannot be empty."
        }),
        phone: genralRules.phone.messages({
            "string.empty": "Phone number cannot be empty."
        }),
    }).min(1).messages({
        "object.min": "You must provide at least one field: firstName, lastName, gender, birthdate, or phone."
    }),
    headers: joi.object({
        authorization: genralRules.authorization.required().messages({
            "any.required": "Authorization header is required.",
        }),
        authtype: genralRules.authType.required().messages({
            "any.required": "authType is required.",
        }),
        "content-type": joi.string().optional(),
        "user-agent": joi.string().optional(),
        accept: joi.string().optional(),
        "cache-control": joi.string().optional(),
        "postman-token": joi.string().optional(),
        host: joi.string().optional(),
        "accept-encoding": joi.string().optional(),
        connection: joi.string().optional(),
        "content-length": joi.string().optional(),
    }).unknown(false),
};
export const updatePasswordSchema = {
    body: joi.object({
        old: genralRules.password.required().messages({
            "any.required": "Password is required.",
            "string.empty": "Password cannot be empty."
        }),
        password: genralRules.password.required().messages({
            "any.required": "Password is required.",
            "string.empty": "Password cannot be empty."
        }),
        Repassword: genralRules.Repassword.required().messages({
            "any.required": "Password confirmation is required.",
            "string.empty": "Password confirmation cannot be empty."
        }),
    }),
    headers: joi.object({
        authorization: genralRules.authorization.required().messages({
            "any.required": "Authorization header is required.",
        }),
        authtype: genralRules.authType.required().messages({
            "any.required": "authType is required.",
        }),
        "content-type": joi.string().optional(),
        "user-agent": joi.string().optional(),
        accept: joi.string().optional(),
        "cache-control": joi.string().optional(),
        "postman-token": joi.string().optional(),
        host: joi.string().optional(),
        "accept-encoding": joi.string().optional(),
        connection: joi.string().optional(),
        "content-length": joi.string().optional(),
    }).unknown(false),

};

export const updateProfileImgs = {
    file: genralRules.file.required().messages({
        "any.required": "File is required.",
        "object.base": "Invalid file format.",
    }),
    headers: joi.object({
        authorization: genralRules.authorization.required().messages({
            "any.required": "Authorization header is required.",
        }),
        authtype: genralRules.authType.required().messages({
            "any.required": "authType is required.",
        }),
        "content-type": joi.string().optional(),
        "user-agent": joi.string().optional(),
        accept: joi.string().optional(),
        "cache-control": joi.string().optional(),
        "postman-token": joi.string().optional(),
        host: joi.string().optional(),
        "accept-encoding": joi.string().optional(),
        connection: joi.string().optional(),
        "content-length": joi.string().optional(),
    }).unknown(false),
}
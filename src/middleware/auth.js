import * as DBS from "../DB/dbService.js";
import companyModel from "../DB/models/company/company.model.js";
import userModel, { defaultAuthTypes } from "../DB/models/user/user.model.js";
import { asyncHandler, decryption, verfyCryptedToken } from "../utils/utils.js";
export const authorization = () => {
    return asyncHandler(async (req, res, next) => {
        const authorization = req.header('Authorization');
        const authType = req.header('authtype');
        if (!authorization) return next(new Error('Unauthorized', { cause: { status: 401 } }))
        const sign = authType === defaultAuthTypes.Admin ? process.env.SIGNATURE_TOKEN_ADMIN : process.env.SIGNATURE_TOKEN_USE
        const token = await verfyCryptedToken({ value: authorization, sign })
        if (!token) {
            return next(new Error('Unauthorized', { cause: { status: 401 } }))
        }

        const user = await DBS.findById({
            model: userModel,
            id: token.id
        })
        if (!user) {
            return next(new Error('User Not Found', { cause: { status: 401 } }));
        }
        if (token.secret !== user.tokenSecret) {
            return next(new Error('Token is invalid', { cause: { status: 401 } }))
        }
        delete user.tokenSecret;
        req.user = user;
        return next();
    })
}
export const findEmail = (type = "exists") => {
    return asyncHandler(async (req, res, next) => {
        const { email } = req.body;
        const exsistEmail = await DBS.findOne({
            model: userModel,
            filter: { email }
        });

        if (exsistEmail) {
            if (type === "unique") {
                return next(new Error(`Email is already exist`, { cause: { status: 409 } }));
            }
            req.user = exsistEmail;
            return next();
        }
        if (type === "exists") {
            return next(new Error(`Email not found`, { cause: { status: 404 } }));
        }
        next();
    });
};
export const ForgetPasswordAuth = () => {
    return asyncHandler(async (req, res, next) => {
        const authorization = req.header('Authorization');
        const verfyToken = await verfyCryptedToken({ value: authorization, sign: process.env.SIGNATURE_TOKEN_FORGET })
        if (!verfyToken) {
            return next(new Error('Token is invalid', { cause: { status: 401 } }));
        }
        const user = await DBS.findById({
            model: userModel,
            id: verfyToken.id
        })
        if (!user) {
            return next(new Error('User Not Found', { cause: { status: 401 } }));
        }
        console.log(verfyToken.secret);
        console.log(user.resetTokenSecret);

        if (verfyToken.secret !== user.resetTokenSecret) {
            return next(new Error('Token is invalid', { cause: { status: 401 } }))
        }
        req.user = user;
        return next();
    })
}
export const refreshTokenAuth = () => {
    return asyncHandler(async (req, res, next) => {
        const authorization = req.header('Authorization');
        const authType = req.header('authtype');
        const sign = authType === defaultAuthTypes.Admin ? process.env.SIGNATURE_TOKEN_ADMIN_REFRESH : process.env.SIGNATURE_TOKEN_USER_REFRESH
        const token = await verfyCryptedToken({ value: authorization, sign })
        if (!token) {
            return next(new Error('Token is invalid', { cause: { status: 401 } }))
        }
        const user = await DBS.findById({
            model: userModel,
            id: token.id
        })
        if (!user) {
            return next(new Error('User Not Found', { cause: { status: 401 } }));
        }
        if (token.secret !== user.tokenSecret) {
            return next(new Error('Token is invalid', { cause: { status: 401 } }))
        }
        req.user = user;
        return next();
    })
}
export const authenticationGraphQl = async (authorization, authType) => {
    if (!authorization) {
        throw new Error("authorization denied 1");
    }
    let sign;
    if (authType === defaultAuthTypes.Admin) {
        sign = process.env.SIGNATURE_TOKEN_ADMIN
    } else if (authType === defaultAuthTypes.Bearer) {
        sign = process.env.SIGNATURE_TOKEN_USER
    } else {
        throw new Error("authorization denied")
    }
    const decodedToken = await verfyCryptedToken({ value: authorization, sign });
    if (!decodedToken) {
        throw new Error("authorization denied");
    }
    const user = await DBS.findById({
        model: userModel,
        id: decodedToken.id
    });
    if (!user || user.tokenSecret !== decodedToken.secret) {
        throw new Error("authorization denied 3");
    }
    delete user.tokenSecret;
    return user;
}
export const findCompanyDetails = (type = "exists") => {
    return asyncHandler(async (req, res, next) => {
        const { companyEmail, companyName } = req.body;

        const filter = {};
        if (companyEmail) filter.companyEmail = companyEmail;
        if (companyName) filter.companyName = companyName;

        if (Object.keys(filter).length === 0) {
            return next();
        }

        const existingCompany = await DBS.findOne({
            model: companyModel,
            filter
        });

        if (existingCompany) {
            if (type === "unique") {
                if (companyEmail && existingCompany.companyEmail === companyEmail && companyName && existingCompany.companyName === companyName) {
                    return next(new Error("Company Email and Name are already taken", { cause: { status: 409 } }));
                } else if (companyEmail && existingCompany.companyEmail === companyEmail) {
                    return next(new Error("Company Email is already taken", { cause: { status: 409 } }));
                } else if (companyName && existingCompany.companyName === companyName) {
                    return next(new Error("Company Name is already taken", { cause: { status: 409 } }));
                }
            }
            req.company = existingCompany;
            return next();
        }

        if (type === "exists") {
            return next(new Error("Company not found", { cause: { status: 404 } }));
        }

        next();
    });
};

export const authorizationSocketIo = async (auth) => {
    const { authorization, authType } = auth;
    if (!authorization) {
        return { message: 'Unauthorized', statusCode: 401 };
    }
    const sign = authType === defaultAuthTypes.Admin? process.env.SIGNATURE_TOKEN_ADMIN: process.env.SIGNATURE_TOKEN_USE;
    const token = await verfyCryptedToken({ value: authorization, sign });
    if (!token) {
        return { message: 'Unauthorized', statusCode: 401 };
    }

    const user = await DBS.findById({
        model: userModel,
        id: token.id
    });

    if (!user) {
        return { message: 'User Not Found', statusCode: 401 };
    }

    if (token.secret !== user.tokenSecret) {
        return { message: 'Token is invalid', statusCode: 401 };
    }

    delete user.tokenSecret;
    return { user, statusCode: 200 };
};

import { config } from "dotenv";
config();
import * as DBS from "../../DB/dbService.js";
import userModel, { defaultAuthTypes, defaultRoles } from "../../DB/models/user/user.model.js";
import { validationGraphQl } from "../../middleware/validation.js";
import { authenticationGraphQl } from "../../middleware/auth.js";
import { getInfoSchema, token_id } from "./validation.js";
import companyModel from "../../DB/models/company/company.model.js";
export const getUsersAndCompanies = async (parent, args) => {
    await validationGraphQl({ schema: getInfoSchema, data: args })
    const auth = await authenticationGraphQl(args.authorization, args.authType);
    if (auth.role !== defaultRoles.admin || args.authType !== defaultAuthTypes.Admin) {
        throw new Error('You are not authorized to perform this action')
    }
    const users = await DBS.find({
        model: userModel,
    })
    const companies = await DBS.find({
        model: companyModel,
    })
    console.log("Users:", users, "Companies:", companies);    
    return [{ users, companies }];
}
export const bannedUser = async (parent, args) => {
    await validationGraphQl({ schema: token_id, data: args });

    const auth = await authenticationGraphQl(args.authorization, args.authType);
    if (auth.role !== defaultRoles.admin || args.authType !== defaultAuthTypes.Admin) {
        throw new Error("You are not authorized to perform this action");
    }

    const user = await DBS.findById({ model: userModel, id: args.id });
    if (!user) {
        throw new Error("User not found");
    }

    if (auth._id.toString() === user._id.toString()) {
        throw new Error("You cannot ban yourself");
    }

    if (user.role === defaultRoles.admin) {
        throw new Error("You cannot ban another admin");
    }

    const updatedUser = await DBS.findByIdAndUpdate({
        model: userModel,
        id: args.id,
        update: { bannedAt: user.bannedAt ? null : new Date() },
    });

    return {
        message: updatedUser.bannedAt ? "User has been banned successfully" : "User has been unbanned successfully",
        user: {
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
        },
    };
};
export const bannedCompany = async (parent, args) => {
    await validationGraphQl({ schema: token_id, data: args });

    const auth = await authenticationGraphQl(args.authorization, args.authType);
    if (auth.role !== defaultRoles.admin || args.authType !== defaultAuthTypes.Admin) {
        throw new Error("You are not authorized to perform this action");
    }
    const company = await DBS.findById({ model: companyModel, id: args.id });
    if (!company) {
        throw new Error("Company not found");
    }

    const updatedCompany = await DBS.findByIdAndUpdate({
        model: companyModel,
        id: args.id,
        update: { bannedAt: company.bannedAt ? null : new Date() },
    });
    console.log(company);
    
    return {
        message: updatedCompany.bannedAt 
            ? "Company has been banned successfully" 
            : "Company has been unbanned successfully",
            company
    };
};

export const AproveCompany = async (parent, args) => {
    await validationGraphQl({ schema: token_id, data: args });

    const auth = await authenticationGraphQl(args.authorization, args.authType);
    if (auth.role !== defaultRoles.admin || args.authType !== defaultAuthTypes.Admin) {
        throw new Error("You are not authorized to perform this action");
    }

    const company = await DBS.findById({ model: companyModel, id: args.id });
    if (!company) {
        throw new Error("Company not found");
    }
    const updatedCompany = await DBS.findByIdAndUpdate({
        model: companyModel,
        id: args.id,
        update: { approvedByAdmin: !company.approvedByAdmin }, 
        options: { new: true }, 
    });

    return {
        message: updatedCompany.approvedByAdmin 
            ? "Company has been approved successfully" 
            : "Company approval has been revoked",
        company: updatedCompany
    };
};

import joi from "joi";
import { genralRules } from "../../utils/utils.js";
import { defaultJobLocations, defaultSortOptions, defaultWorkingTimes } from "../../DB/models/job/job.model.js";
export const addjobSchema = {
    params: joi.object({
        companyId: genralRules.ObjectId.required().messages({
            "any.required": "companyId is required.",
            "string.empty": "companyId cannot be empty.",
        })
    }),
    body: joi.object({
        jobTitle: genralRules.jobTitle.required().messages({
            "string.empty": "jobTitle cannot be empty.",
            "any.required": "jobTitle is required."
        }),
        jobLocation: genralRules.jobLocation.required().messages({
            "string.empty": "jobLocation cannot be empty.",
            "any.required": "jobLocation is required."
        }),
        workingTime: genralRules.workingTime.required().messages({
            "string.empty": "workingTime cannot be empty.",
            "any.required": "workingTime is required."
        }),
        seniorityLevel: genralRules.seniorityLevel.required().messages({
            "string.empty": "seniorityLevel cannot be empty.",
            "any.required": "seniorityLevel is required."
        }),
        jobDescription: genralRules.jobDescription.required().messages({
            "string.empty": "jobDescription cannot be empty.",
            "any.required": "jobDescription is required."
        }),
        technicalSkills: genralRules.technicalSkills.required().messages({
            "array.base": "technicalSkills must be an array.",
            "array.empty": "technicalSkills cannot be empty.",
            "any.required": "technicalSkills are required."
        }),
        softSkills: genralRules.softSkills.required().messages({
            "array.base": "softSkills must be an array.",
            "array.empty": "softSkills cannot be empty.",
            "any.required": "softSkills are required."
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
export const updatejobSchema = {
    params: joi.object({
        jobId: genralRules.ObjectId.required().messages({
            "any.required": "companyId is required.",
            "string.empty": "companyId cannot be empty.",
        })
    }),
    body: joi.object({
        jobTitle: genralRules.jobTitle.messages({
            "string.empty": "jobTitle cannot be empty."
        }),
        jobLocation: genralRules.jobLocation.messages({
            "string.empty": "jobLocation cannot be empty."
        }),
        workingTime: genralRules.workingTime.messages({
            "string.empty": "workingTime cannot be empty."
        }),
        seniorityLevel: genralRules.seniorityLevel.messages({
            "string.empty": "seniorityLevel cannot be empty."
        }),
        jobDescription: genralRules.jobDescription.messages({
            "string.empty": "jobDescription cannot be empty."
        }),
        technicalSkills: genralRules.technicalSkills.messages({
            "array.base": "technicalSkills must be an array.",
            "array.empty": "technicalSkills cannot be empty."
        }),
        softSkills: genralRules.softSkills.messages({
            "array.base": "softSkills must be an array.",
            "array.empty": "softSkills cannot be empty."
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
};
export const deletedJobSchema = {
    params: joi.object({
        jobId: genralRules.ObjectId.required().messages({
            "any.required": "jobId is required.",
            "string.empty": "jobId cannot be empty.",
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
export const getJobSchema = {
    params: joi.object({
        jobId: genralRules.ObjectId.required().messages({
            "any.required": "jobId is required.",
            "string.empty": "jobId cannot be empty.",
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
export const getCompanyJobsSchema = {
    params: joi.object({
        companyId: genralRules.ObjectId.optional()
    }),
    query: joi.object({
        jobId: genralRules.ObjectId.optional(),
        companyName: genralRules.companyName.optional(),
        sort: joi.string().valid(...Object.values(defaultSortOptions)).optional(),
        page: joi.number().integer().min(1).optional(),
        limit: joi.number().integer().min(1).optional(),
        workingTime: joi.string().valid(...Object.values(defaultWorkingTimes)).optional(),
        jobLocation: joi.string().valid(...Object.values(defaultJobLocations)).optional(),
        jobTitle: genralRules.jobTitle.optional(),
        technicalSkills: genralRules.technicalSkills.optional()
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
    }).unknown(true),
};
export const filterCompanyJobsSchema = {
    params: joi.object({
        companyId: genralRules.ObjectId.optional()
    }),
    query: joi.object({
        jobId: genralRules.ObjectId.optional(),
        companyName: genralRules.companyName.optional(),
        sort: joi.string().valid(...Object.values(defaultSortOptions)).optional(),
        sort: joi.string().valid(...Object.values(defaultSortOptions)).optional(),
        technicalSkills: joi.string().optional(),
        page: joi.number().integer().min(1).optional(),
        limit: joi.number().integer().min(1).optional(),
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
    }).unknown(true),
};
export const applayJobJobsSchema = {
    params: joi.object({
        jobId: genralRules.ObjectId.optional()
    }),
    file: genralRules.file.required().messages({
        "any.required": "cv file is required.",
        "object.base": "Invalid cv format.",
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
    }).unknown(true),
};
export const interactionApplcaySchema = {
    params: joi.object({
        applicationId: genralRules.ObjectId.optional()
    }),
    body: joi.object({
        intractionType : genralRules.applicationStatus.required()
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
    }).unknown(true),
};
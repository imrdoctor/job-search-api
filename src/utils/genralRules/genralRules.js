import joi from "joi";
import { Types } from "mongoose";
import { defaultAuthTypes, defaultGenders, defaultRoles, verfyTypes } from "../../DB/models/user/user.model.js";
import { defaultJobLocations, defaultSeniorityLevels, defaultWorkingTimes } from "../../DB/models/job/job.model.js";
import { APPLICATION_STATUS } from "../../DB/models/application/application.js";
export const customId = (value, helper) => {
    let data = Types.ObjectId.isValid(value);
    return data ? value : helper.message("id is not a valid")
}
const today = new Date();
const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
export const genralRules = {
    ////////////////// Global variables  //////////////////
    ObjectId: joi.string().custom(customId).messages({
        "string.base": "id must be a string",
        "string.empty": "id is required",
        "string.custom": "id is not a valid",
    }),
    verfyType: joi.string().valid(verfyTypes.otp, verfyTypes.link).messages({
        "any.only": "verfyType must be either 'link' or 'otp'",
        "string.base": "verfyType must be a string",
        "any.required": "verfyType is required"
    }),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required(),
    }),
    ////////////////// User Variable  //////////////////
    firstName: joi.string().min(2).max(10).messages({
        'string.base': 'firstName must be a string',
        'string.empty': 'firstName is required',
        'string.min': 'firstName must be at least 2 characters',
        'string.max': 'firstName must not exceed 10 characters',
        'any.required': 'firstName is required',
    }),
    lastName: joi.string().min(2).max(10).messages({
        'string.base': 'lastName must be a string',
        'string.empty': 'lastName is required',
        'string.min': 'lastName must be at least 2 characters',
        'string.max': 'lastName must not exceed 10 characters',
        'any.required': 'lastName is required',
    }),
    email: joi.string().email({ tlds: { allow: true } }).messages({
        'string.base': 'Email must be a string',
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    password: joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/).messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password is required',
        'string.pattern.base':
            'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
    }),
    Repassword: joi.string().valid(joi.ref('password')).messages({
        'any.only': 'Repassword must match Password',
        'string.empty': 'Repassword is required',
        'any.required': 'Repassword is required',
    }),
    gender: joi.string().valid(defaultGenders.female, defaultGenders.male).messages({
        'string.base': 'Gender must be a string',
        'string.empty': 'Gender is required',
        'any.only': 'Gender must be either "male" or "female"',
        'any.required': 'Gender is required',
    }),
    birthdate: joi.date().max(minAgeDate).messages({
        "date.base": "Birthdate must be a valid date.",
        "date.max": "You must be at least 18 years old.",
        "any.required": "Birthdate is required."
    }),
    phone: joi.string().regex(/^01[0125][0-9]{8}$/).messages({
        'string.base': 'Phone number must be a string',
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Phone number must be a Egyption number',
        'any.required': 'Phone number is required',
    }),
    role: joi.string().valid(...Object.values(defaultRoles)).required().messages({
        "any.only": "Invalid role. Allowed roles: admin, user.",
        "any.required": "Role is required."
    }),
    otp: joi.string().pattern(/^\d{6}$/).messages({
        // Using regex ensures the OTP is exactly 6 digits  
        // joi.number() allows decimals and negative values, which we want to avoid 
        "string.pattern.base": "OTP must be exactly 6 digits",
        "string.empty": "OTP is required"
    }),
    idToken: joi.string(),
    ////////////////// company Variable  //////////////////
    companyName: joi.string().min(2).max(20).messages({
        'string.base': 'companyName must be a string',
        'string.empty': 'companyName cannot be empty',
        'string.min': 'companyName must be at least 2 characters',
        'string.max': 'companyName must not exceed 20 characters',
    }),

    description: joi.string().min(10).max(500).messages({
        'string.base': 'description must be a string',
        'string.empty': 'description cannot be empty',
        'string.min': 'description must be at least 10 characters',
        'string.max': 'description must not exceed 500 characters',
    }),

    industry: joi.string().min(3).max(50).messages({
        'string.base': 'industry must be a string',
        'string.empty': 'industry cannot be empty',
        'string.min': 'industry must be at least 3 characters',
        'string.max': 'industry must not exceed 50 characters',
    }),

    address: joi.string().min(5).max(100).messages({
        'string.base': 'address must be a string',
        'string.empty': 'address cannot be empty',
        'string.min': 'address must be at least 5 characters',
        'string.max': 'address must not exceed 100 characters',
    }),

    companyEmail: joi.string().email().messages({
        'string.base': 'companyEmail must be a string',
        'string.email': 'companyEmail must be a valid email address',
        'string.empty': 'companyEmail cannot be empty',
    }),

    numberOfEmployees: joi.string()
        .valid("1-10", "11-20", "21-50", "51-100", "101-500", "500+")
        .messages({
            'string.base': 'numberOfEmployees must be a string',
            'any.only': 'numberOfEmployees must be one of the following: 1-10, 11-20, 21-50, 51-100, 101-500, 500+',
        }),
    ////////////////// Job Variable  //////////////////
    jobTitle: joi.string().min(2).max(20).messages({
        "string.base": "jobTitle must be a string",
        "string.empty": "jobTitle cannot be empty",
        "string.min": "jobTitle must be at least 2 characters",
        "string.max": "jobTitle must not exceed 20 characters"
    }),
    jobLocation: joi.string().valid(...Object.values(defaultJobLocations)).messages({
        "string.base": "jobLocation must be a string",
        "any.only": `jobLocation must be one of the following: ${Object.values(defaultJobLocations).join(", ")}`,
        "any.required": "jobLocation is required"
    }),
    workingTime: joi.string().valid(...Object.values(defaultWorkingTimes)).messages({
        "string.base": "workingTime must be a string",
        "any.only": `workingTime must be one of the following: ${Object.values(defaultWorkingTimes).join(", ")}`,
        "any.required": "workingTime is required"
    }),
    seniorityLevel: joi.string().valid(...Object.values(defaultSeniorityLevels)).messages({
        "string.base": "seniorityLevel must be a string",
        "any.only": `seniorityLevel must be one of the following: ${Object.values(defaultSeniorityLevels).join(", ")}`,
        "any.required": "seniorityLevel is required"
    }),
    applicationStatus: joi.string().valid(...Object.values(APPLICATION_STATUS)).messages({
        "string.base": "applcation Status  must be a string",
        "any.only": `applcation Status  must be one of the following: ${Object.values(APPLICATION_STATUS).join(", ")}`,
        "any.required": "applcation Status is required"
    }),
    jobDescription: joi.string().min(10).max(1000).messages({
        "string.base": "jobDescription must be a string",
        "string.empty": "jobDescription cannot be empty",
        "string.min": "jobDescription must be at least 10 characters",
        "string.max": "jobDescription must not exceed 1000 characters"
    }),
    technicalSkills: joi.array().items(joi.string().min(2)).min(1).messages({
        "array.base": "technicalSkills must be an array",
        "array.min": "technicalSkills must have at least one skill",
        "string.base": "Each technical skill must be a string",
        "string.min": "Each technical skill must be at least 2 characters"
    }),
    softSkills: joi.array().items(joi.string().min(2)).min(1).messages({
        "array.base": "softSkills must be an array",
        "array.min": "softSkills must have at least one skill",
        "string.base": "Each soft skill must be a string",
        "string.min": "Each soft skill must be at least 2 characters"
    }),
    closed: joi.boolean().messages({
        "boolean.base": "closed must be a boolean"
    }),
    authorization: joi.string(),
    authType: joi.string().valid(...Object.keys(defaultAuthTypes))
}
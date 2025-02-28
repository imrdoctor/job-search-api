import joi from "joi";
import { genralRules } from "../../utils/utils.js";
import { defaultAuthTypes } from "../../DB/models/user/user.model.js";
export const getInfoSchema = joi.object({
    authorization: genralRules.authorization.required(),
    authType: joi.string().valid(...Object.values(defaultAuthTypes)).required(),
});
export const token_id = joi.object({
    authorization: genralRules.authorization.required(),
    authType: joi.string().valid(...Object.values(defaultAuthTypes)).required(),
    id: genralRules.ObjectId.required(),
});
import { encryption } from "../utils.js";
import { generateToken } from "../utils.js";
import { config } from "dotenv";
config();
export const generatedCryptToken = ({payload, signKey, expiresIn}) => {
   const token =  generateToken({ payload, signKey, expiresIn });      
    // crypt this token
    const encryptedToken = encryption({
        value: token,
        key: process.env.encryptKey
    });
    return encryptedToken;
}
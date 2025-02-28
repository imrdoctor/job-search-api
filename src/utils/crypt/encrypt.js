import dotenv from 'dotenv';
dotenv.config();
import CryptoJS from "crypto-js"

export const encryption = async ({value , key = process.env.ENCRYPTKEY}) => {
    return CryptoJS.AES.encrypt(value, key).toString();
}
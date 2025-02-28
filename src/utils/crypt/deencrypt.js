import dotenv from 'dotenv';
dotenv.config();
import CryptoJS from "crypto-js"

export const decryption = async ({value , key = process.env.ENCRYPTKEY}) => {
    return await CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8)
}
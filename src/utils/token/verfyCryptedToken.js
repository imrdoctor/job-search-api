import { decryption } from "../utils.js"
import { verifyToken } from "./index.js";
export const verfyCryptedToken = async ({ value, sign }) => {
    try {
        const decryptedToken = await decryption({
            value,
            key: process.env.encryptKey
        });
        if (!decryptedToken) {
            throw new Error("Decryption failed");
        }
        const verfiedToken = verifyToken({ value: decryptedToken, sign });
        return verfiedToken;
    } catch (error) {
        console.error("Error in verfyCryptedToken:", error.message);
        return null;
    }
}

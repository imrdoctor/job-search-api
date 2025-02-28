import crypto from "crypto";
export const generateSecret = () => {
    return crypto.randomBytes(16).toString("hex");
};
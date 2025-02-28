import jwt from "jsonwebtoken"


export const generateToken = ({ payload, signKey, expiresIn }) => {
    const options = expiresIn ? { expiresIn } : {}; 
    return jwt.sign(payload, signKey, options); 
};
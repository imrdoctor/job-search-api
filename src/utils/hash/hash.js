import dotenv from 'dotenv';
dotenv.config();
import bcrypt from "bcrypt"
export const hashing = async ({value,saltRounds = process.env.BYCRYPTSOLT_ROUNDS})=>{
    return bcrypt.hashSync(value, saltRounds);
}
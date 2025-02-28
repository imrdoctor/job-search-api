import dotenv from 'dotenv';
dotenv.config();
import bcrypt from "bcrypt"


export const hashCompare = async ({current,old})=>{
    return bcrypt.compareSync(current, old);
}
import chalk from 'chalk';
import { config } from 'dotenv'
config()
import mongoose from "mongoose";
const DBURI = process.env.MODE == "DEV" ? process.env.MONGODB_URI : process.env.URI_ONLINE
export const connectionDB = async () => {
    try {
        await mongoose.connect(DBURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(chalk.green("🟢 Connected to database: " + DBURI));
    }catch (error) {
        console.error(chalk.red(`🔴 Error connecting to database:: ${error.message}`));
        process.exit(1);
    }
}
import cron from "node-cron";
import chalk from "chalk";
import * as DBS from "../../DB/dbService.js";
import userModel from "../../DB/models/user/user.model.js";

export const deleteExpiredOTPs = cron.schedule("0 */6 * * *", async () => {
    try {
        const now = new Date();
        const result = await DBS.updateMany({
            model: userModel,
            filter: {
                "OTPs.expiresIn": { $lt: now },
            },
            update: {
                $pull: {
                    OTPs: { expiresIn: { $lt: now } }
                }
            }
        }
        );
        if (result.modifiedCount > 0) {
            console.log(chalk.green("✅ Expired OTPs deleted successfully"));
        } else {
            console.log(chalk.yellow("⚠️  No expired OTPs found to delete"));
        }
    } catch (error) {
        console.error(chalk.red("❌ Error deleting expired OTPs: "), error);
    }
});

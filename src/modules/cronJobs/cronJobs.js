import cron from "node-cron";
import chalk from "chalk";
import * as DBS from "../../DB/dbService.js";
import userModel from "../../DB/models/user/user.model.js";
import fs from "fs";
import path from "path";

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

export const deleteExpiredImages = cron.schedule("*/5 * * * *", async () => {
    const dir = path.resolve("temp/generated");
  
    try {
      if (!fs.existsSync(dir)) {
        console.log(chalk.yellow("⚠️  Temp folder does not exist. Skipping cleanup."));
        return;
      }
      const files = fs.readdirSync(dir);
      if (files.length === 0) {
        console.log(chalk.yellow("⚠️  No files found in temp folder. Skipping cleanup."));
        return;
      }
      const now = Date.now();
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const fileStats = fs.statSync(filePath);
        if (now - fileStats.mtimeMs > 1 * 60 * 1000) {
          fs.unlinkSync(filePath);
          console.log(chalk.green(`✅ Deleted expired file: ${file}`));
        }
      });
      console.log(chalk.blue("🧹 Cleanup completed successfully (files older than 1 min deleted)"));
    } catch (error) {
      console.error(chalk.red("❌ Error during cleanup: "), error);
    }
});
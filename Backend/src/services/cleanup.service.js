const cron = require("node-cron");
const pool = require("../config/db");

const startCleanupJob = () => {

    cron.schedule("0 0 * * *", async () => {

        try {

            const [result] = await pool.query(
                `DELETE FROM password_reset_otps
                 WHERE created_at < NOW() - INTERVAL 30 DAY`
            );

            console.log(
                `[Cleanup Job] Deleted ${result.affectedRows} OTP records`
            );

        } catch (error) {

            console.error("[Cleanup Job]", error);

        }

    });

};

module.exports = {
    startCleanupJob
};
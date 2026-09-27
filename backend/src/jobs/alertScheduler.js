import cron from "node-cron";
import { pool } from "../db.js";

export function startAlertScheduler() {
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) AS expired_count
        FROM compliance_record
        WHERE status = 'expired';
      `);

      console.log(
        `KhanRakshak alert scheduler: ${result.rows[0].expired_count} expired compliance record(s)`
      );
    } catch (error) {
      console.error("Alert scheduler error:", error.message);
    }
  });
}

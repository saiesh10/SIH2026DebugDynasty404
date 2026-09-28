import cron from "node-cron";
import { pool } from "../db.js";

export async function checkAlerts() {
  await pool.query(`
    UPDATE compliance_record
    SET status = 'expired'
    WHERE expiry_date < CURRENT_DATE AND status <> 'expired';
  `);

  await pool.query(`
    INSERT INTO notification (fingerprint, notification_type, mine_id, message)
    SELECT candidate.fingerprint, candidate.notification_type,
           candidate.mine_id, candidate.message
    FROM (
      SELECT
        'expired-compliance:' || cr.id || ':' || cr.expiry_date AS fingerprint,
        'expired_compliance' AS notification_type,
        cr.mine_id,
        cr.type || ' clearance expired on ' || cr.expiry_date AS message
      FROM compliance_record cr
      WHERE cr.expiry_date < CURRENT_DATE
      UNION ALL
      SELECT
        'expiring-compliance:' || cr.id || ':' || cr.expiry_date,
        'upcoming_expiry', cr.mine_id,
        cr.type || ' clearance expires on ' || cr.expiry_date
      FROM compliance_record cr
      WHERE cr.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
      UNION ALL
      SELECT
        'overdue-action:' || ca.id || ':' || ca.due_date,
        'overdue_action', i.mine_id,
        'Corrective action is overdue since ' || ca.due_date
      FROM corrective_action ca
      JOIN inspection i ON i.id = ca.inspection_id
      WHERE ca.status = 'open' AND ca.due_date < CURRENT_DATE
    ) AS candidate
    WHERE NOT EXISTS (
      SELECT 1 FROM notification n WHERE n.fingerprint = candidate.fingerprint
    );
  `);
}

export function startAlertScheduler() {
  const run = async () => {
    try {
      await checkAlerts();
    } catch (error) {
      console.error(
        "Alert scheduler skipped: database is unavailable. Start PostgreSQL and confirm DATABASE_URL.",
        error.message
      );
    }
  };

  run();
  cron.schedule("*/15 * * * *", run);
}

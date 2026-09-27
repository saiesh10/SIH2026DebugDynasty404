import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const minesResult = await pool.query(`
      SELECT COUNT(*) AS total_mines
      FROM mine;
    `);

    const complianceResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'valid') AS valid,
        COUNT(*) FILTER (WHERE status = 'expired') AS expired,
        COUNT(*) FILTER (WHERE status = 'pending_renewal') AS pending_renewal
      FROM compliance_record;
    `);

    const inspectionResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE severity = 'high') AS high,
        COUNT(*) FILTER (WHERE severity = 'medium') AS medium,
        COUNT(*) FILTER (WHERE severity = 'low') AS low
      FROM inspection;
    `);

    const correctiveActionResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'open') AS open,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE status = 'closed') AS closed
      FROM corrective_action;
    `);

    res.json({
      mines: minesResult.rows[0],
      compliance: complianceResult.rows[0],
      inspections: inspectionResult.rows[0],
      corrective_actions: correctiveActionResult.rows[0]
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard summary"
    });
  }
});

export default router;

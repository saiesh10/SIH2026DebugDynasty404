import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET risk summary for one mine
router.get("/:mineId", async (req, res) => {
  try {
    const { mineId } = req.params;

    const mineResult = await pool.query(`
      SELECT id, name
      FROM mine
      WHERE id = $1;
    `, [mineId]);

    if (mineResult.rows.length === 0) {
      return res.status(404).json({
        error: "Mine not found"
      });
    }

    const complianceResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'expired') AS expired,
        COUNT(*) FILTER (WHERE status = 'pending_renewal') AS pending_renewal,
        COUNT(*) FILTER (WHERE status = 'valid') AS valid
      FROM compliance_record
      WHERE mine_id = $1;
    `, [mineId]);

    const inspectionResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE severity = 'high') AS high,
        COUNT(*) FILTER (WHERE severity = 'medium') AS medium,
        COUNT(*) FILTER (WHERE severity = 'low') AS low
      FROM inspection
      WHERE mine_id = $1;
    `, [mineId]);

    const compliance = complianceResult.rows[0];
    const inspections = inspectionResult.rows[0];

    const riskScore =
      Number(compliance.expired) * 30 +
      Number(compliance.pending_renewal) * 15 +
      Number(inspections.high) * 20 +
      Number(inspections.medium) * 10;

    let riskLevel = "low";

    if (riskScore >= 60) {
      riskLevel = "high";
    } else if (riskScore >= 30) {
      riskLevel = "medium";
    }

    res.json({
      mine: mineResult.rows[0],
      risk_score: riskScore,
      risk_level: riskLevel,
      compliance,
      inspections
    });
  } catch (error) {
    console.error("Error calculating mine risk:", error);
    res.status(500).json({
      error: "Failed to calculate mine risk"
    });
  }
});

export default router;

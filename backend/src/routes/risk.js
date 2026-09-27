import express from "express";
import { pool } from "../db.js";
import { evaluateRiskRules } from "../risk/ruleEngine.js";
import {
  detectZScoreAnomalies,
  buildSyntheticMineSeries
} from "../risk/anomalyModel.js";

const router = express.Router();

router.get("/:mineId", async (req, res) => {
  try {
    const { mineId } = req.params;

    const mineResult = await pool.query(`
      SELECT id, name
      FROM mine
      WHERE id = $1;
    `, [mineId]);

    if (mineResult.rows.length === 0) {
      return res.status(404).json({ error: "Mine not found" });
    }

    const complianceResult = await pool.query(`
      SELECT id, type, issue_date, expiry_date, status, responsible_officer
      FROM compliance_record
      WHERE mine_id = $1;
    `, [mineId]);

    const inspectionResult = await pool.query(`
      SELECT id, inspection_date, category, findings, severity, inspector_name
      FROM inspection
      WHERE mine_id = $1
      ORDER BY inspection_date DESC;
    `, [mineId]);

    const correctiveActionResult = await pool.query(`
      SELECT ca.id, ca.inspection_id, ca.description, ca.due_date, ca.status
      FROM corrective_action ca
      JOIN inspection i ON ca.inspection_id = i.id
      WHERE i.mine_id = $1;
    `, [mineId]);

    const contractorPermitResult = await pool.query(`
      SELECT c.id, c.name, c.work_permit_expiry AS expiry_date
      FROM contractor c
      WHERE c.mine_id = $1;
    `, [mineId]);

    const compliance = {
      expired: complianceResult.rows.filter(
        (record) => record.status === "expired"
      ).length,
      pending_renewal: complianceResult.rows.filter(
        (record) => record.status === "pending_renewal"
      ).length,
      valid: complianceResult.rows.filter(
        (record) => record.status === "valid"
      ).length
    };

    const inspections = {
      high: inspectionResult.rows.filter(
        (inspection) => inspection.severity === "high"
      ).length,
      medium: inspectionResult.rows.filter(
        (inspection) => inspection.severity === "medium"
      ).length,
      low: inspectionResult.rows.filter(
        (inspection) => inspection.severity === "low"
      ).length
    };

    const riskScore =
      compliance.expired * 30 +
      compliance.pending_renewal * 15 +
      inspections.high * 20 +
      inspections.medium * 10;

    let riskLevel = "low";

    if (riskScore >= 60) {
      riskLevel = "high";
    } else if (riskScore >= 30) {
      riskLevel = "medium";
    }

    const riskFlags = evaluateRiskRules({
      complianceRecords: complianceResult.rows,
      correctiveActions: correctiveActionResult.rows,
      inspections: inspectionResult.rows,
      contractorPermits: contractorPermitResult.rows
    });

    const syntheticSeries = buildSyntheticMineSeries(Number(mineId));
    const anomalyResults = detectZScoreAnomalies(syntheticSeries);

    res.json({
      mine: mineResult.rows[0],
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_flags: riskFlags,
      anomaly_model: {
        model: "z-score",
        series: syntheticSeries,
        anomalies: anomalyResults
      },
      compliance,
      inspections
    });
  } catch (error) {
    console.error("Error calculating mine risk:", error);
    res.status(500).json({ error: "Failed to calculate mine risk" });
  }
});

export default router;

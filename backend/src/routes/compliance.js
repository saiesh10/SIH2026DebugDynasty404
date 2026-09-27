import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET all compliance records
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        cr.id,
        cr.mine_id,
        m.name AS mine_name,
        cr.type,
        cr.issue_date,
        cr.expiry_date,
        cr.status,
        cr.responsible_officer
      FROM compliance_record cr
      LEFT JOIN mine m ON cr.mine_id = m.id
      ORDER BY cr.expiry_date ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching compliance records:", error);
    res.status(500).json({
      error: "Failed to fetch compliance records"
    });
  }
});

// GET one compliance record by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        cr.id,
        cr.mine_id,
        m.name AS mine_name,
        cr.type,
        cr.issue_date,
        cr.expiry_date,
        cr.status,
        cr.responsible_officer
      FROM compliance_record cr
      LEFT JOIN mine m ON cr.mine_id = m.id
      WHERE cr.id = $1;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Compliance record not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching compliance record:", error);
    res.status(500).json({
      error: "Failed to fetch compliance record"
    });
  }
});

export default router;

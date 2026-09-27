import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET all inspections
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.mine_id,
        m.name AS mine_name,
        i.inspector_name,
        i.inspection_date,
        i.category,
        i.findings,
        i.severity
      FROM inspection i
      LEFT JOIN mine m ON i.mine_id = m.id
      ORDER BY i.inspection_date DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching inspections:", error);
    res.status(500).json({
      error: "Failed to fetch inspections"
    });
  }
});

export default router;

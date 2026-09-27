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

router.post("/", async (req, res) => {
  const { mine_id, inspector_name, inspection_date, category, findings, severity } = req.body;
  if (!mine_id || !inspection_date || !category || !severity) {
    return res.status(400).json({ error: "mine_id, inspection_date, category and severity are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO inspection
         (mine_id, inspector_name, inspection_date, category, findings, severity)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [mine_id, inspector_name || null, inspection_date, category, findings || null, severity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating inspection:", error);
    res.status(400).json({ error: "Unable to create inspection; check mine, category and severity" });
  }
});

router.put("/:id", async (req, res) => {
  const { mine_id, inspector_name, inspection_date, category, findings, severity } = req.body;
  if (!mine_id || !inspection_date || !category || !severity) {
    return res.status(400).json({ error: "mine_id, inspection_date, category and severity are required" });
  }

  try {
    const result = await pool.query(
      `UPDATE inspection
       SET mine_id = $1, inspector_name = $2, inspection_date = $3,
           category = $4, findings = $5, severity = $6
       WHERE id = $7 RETURNING *;`,
      [mine_id, inspector_name || null, inspection_date, category, findings || null, severity, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inspection not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating inspection:", error);
    res.status(400).json({ error: "Unable to update inspection; check mine, category and severity" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM inspection WHERE id = $1 RETURNING id;",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inspection not found" });
    }
    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting inspection:", error);
    res.status(409).json({ error: "Inspection has corrective actions and cannot be deleted" });
  }
});

export default router;

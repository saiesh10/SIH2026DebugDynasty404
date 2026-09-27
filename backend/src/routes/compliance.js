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
        CASE WHEN cr.expiry_date < CURRENT_DATE THEN 'expired' ELSE cr.status END AS status,
        cr.responsible_officer,
        cr.data_source
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
        CASE WHEN cr.expiry_date < CURRENT_DATE THEN 'expired' ELSE cr.status END AS status,
        cr.responsible_officer,
        cr.data_source
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

router.post("/", async (req, res) => {
  const { mine_id, type, issue_date, expiry_date, status, responsible_officer, data_source } = req.body;
  if (!mine_id || !type || !expiry_date) {
    return res.status(400).json({ error: "mine_id, type and expiry_date are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO compliance_record
         (mine_id, type, issue_date, expiry_date, status, responsible_officer, data_source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [mine_id, type, issue_date || null, expiry_date, status || "valid", responsible_officer || null, data_source || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating compliance record:", error);
    res.status(400).json({ error: "Unable to create compliance record; check mine and record type" });
  }
});

router.put("/:id", async (req, res) => {
  const { mine_id, type, issue_date, expiry_date, status, responsible_officer, data_source } = req.body;
  if (!mine_id || !type || !expiry_date) {
    return res.status(400).json({ error: "mine_id, type and expiry_date are required" });
  }

  try {
    const result = await pool.query(
      `UPDATE compliance_record
       SET mine_id = $1, type = $2, issue_date = $3, expiry_date = $4,
           status = $5, responsible_officer = $6, data_source = $7
       WHERE id = $8 RETURNING *;`,
      [mine_id, type, issue_date || null, expiry_date, status || "valid", responsible_officer || null, data_source || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Compliance record not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating compliance record:", error);
    res.status(400).json({ error: "Unable to update compliance record; check mine and record type" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM compliance_record WHERE id = $1 RETURNING id;",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Compliance record not found" });
    }
    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting compliance record:", error);
    res.status(500).json({ error: "Failed to delete compliance record" });
  }
});

export default router;

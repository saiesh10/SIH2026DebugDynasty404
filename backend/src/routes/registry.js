import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/subsidiaries", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM subsidiary ORDER BY name;"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching subsidiaries:", error);
    res.status(500).json({ error: "Failed to fetch subsidiaries" });
  }
});

router.post("/subsidiaries", async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO subsidiary (name) VALUES ($1) RETURNING id, name;",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating subsidiary:", error);
    res.status(500).json({ error: "Failed to create subsidiary" });
  }
});

router.put("/subsidiaries/:id", async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }
  try {
    const result = await pool.query(
      "UPDATE subsidiary SET name = $1 WHERE id = $2 RETURNING id, name;",
      [name, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Subsidiary not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating subsidiary:", error);
    res.status(500).json({ error: "Failed to update subsidiary" });
  }
});

router.delete("/subsidiaries/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM subsidiary WHERE id = $1 RETURNING id;",
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Subsidiary not found" });
    }
    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting subsidiary:", error);
    res.status(409).json({ error: "Subsidiary is referenced by mines and cannot be deleted" });
  }
});

router.get("/contractors", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.mine_id, m.name AS mine_name, c.name,
             c.work_permit_expiry
      FROM contractor c
      LEFT JOIN mine m ON m.id = c.mine_id
      ORDER BY c.work_permit_expiry;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching contractors:", error);
    res.status(500).json({ error: "Failed to fetch contractors" });
  }
});

router.post("/contractors", async (req, res) => {
  const { mine_id, name, work_permit_expiry } = req.body;
  if (!mine_id || !name?.trim() || !work_permit_expiry) {
    return res.status(400).json({
      error: "mine_id, name and work_permit_expiry are required"
    });
  }
  try {
    const result = await pool.query(
      `INSERT INTO contractor (mine_id, name, work_permit_expiry)
       VALUES ($1, $2, $3) RETURNING *;`,
      [mine_id, name.trim(), work_permit_expiry]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating contractor:", error);
    res.status(400).json({ error: "Unable to create contractor; check mine" });
  }
});

router.put("/contractors/:id", async (req, res) => {
  const { mine_id, name, work_permit_expiry } = req.body;
  if (!mine_id || !name?.trim() || !work_permit_expiry) {
    return res.status(400).json({
      error: "mine_id, name and work_permit_expiry are required"
    });
  }
  try {
    const result = await pool.query(
      `UPDATE contractor SET mine_id = $1, name = $2, work_permit_expiry = $3
       WHERE id = $4 RETURNING *;`,
      [mine_id, name.trim(), work_permit_expiry, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Contractor not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating contractor:", error);
    res.status(400).json({ error: "Unable to update contractor; check mine" });
  }
});

router.delete("/contractors/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM contractor WHERE id = $1 RETURNING id;",
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Contractor not found" });
    }
    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting contractor:", error);
    res.status(500).json({ error: "Failed to delete contractor" });
  }
});

export default router;
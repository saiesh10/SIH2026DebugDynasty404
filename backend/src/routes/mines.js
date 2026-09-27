import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET all mines
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.name,
        m.latitude,
        m.longitude,
        s.name AS subsidiary_name
      FROM mine m
      LEFT JOIN subsidiary s ON m.subsidiary_id = s.id
      ORDER BY m.id;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching mines:", error);
    res.status(500).json({ error: "Failed to fetch mines" });
  }
});

// GET one mine by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        m.id,
        m.name,
        m.latitude,
        m.longitude,
        s.name AS subsidiary_name
      FROM mine m
      LEFT JOIN subsidiary s ON m.subsidiary_id = s.id
      WHERE m.id = $1;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Mine not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching mine:", error);
    res.status(500).json({
      error: "Failed to fetch mine"
    });
  }
});

router.post("/", async (req, res) => {
  const { subsidiary_id, name, latitude, longitude } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO mine (subsidiary_id, name, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       RETURNING id, subsidiary_id, name, latitude, longitude;`,
      [subsidiary_id || null, name.trim(), latitude ?? null, longitude ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating mine:", error);
    res.status(500).json({ error: "Failed to create mine" });
  }
});

router.put("/:id", async (req, res) => {
  const { subsidiary_id, name, latitude, longitude } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE mine
       SET subsidiary_id = $1, name = $2, latitude = $3, longitude = $4
       WHERE id = $5
       RETURNING id, subsidiary_id, name, latitude, longitude;`,
      [subsidiary_id || null, name.trim(), latitude ?? null, longitude ?? null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mine not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating mine:", error);
    res.status(500).json({ error: "Failed to update mine" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM mine WHERE id = $1 RETURNING id;",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mine not found" });
    }
    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting mine:", error);
    res.status(409).json({ error: "Mine is referenced by existing records and cannot be deleted" });
  }
});

export default router;

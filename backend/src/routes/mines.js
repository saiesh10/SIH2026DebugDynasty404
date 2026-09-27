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

export default router;

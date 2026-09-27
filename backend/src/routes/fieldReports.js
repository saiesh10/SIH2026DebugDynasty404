import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      mine_id,
      latitude,
      longitude,
      category,
      observation
    } = req.body;

    if (
      !mine_id ||
      latitude === undefined ||
      longitude === undefined ||
      !category ||
      !observation?.trim()
    ) {
      return res.status(400).json({
        error: "mine_id, latitude, longitude, category, and observation are required"
      });
    }

    const result = await pool.query(
      `
        INSERT INTO field_report (
          mine_id,
          latitude,
          longitude,
          category,
          synced
        )
        VALUES ($1, $2, $3, $4, true)
        RETURNING *;
      `,
      [
        mine_id,
        latitude,
        longitude,
        category
      ]
    );

    res.status(201).json({
      message: "Field report created",
      report: result.rows[0],
      observation
    });
  } catch (error) {
    console.error("Error creating field report:", error);
    res.status(500).json({
      error: "Failed to create field report"
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        fr.*,
        m.name AS mine_name
      FROM field_report fr
      JOIN mine m ON fr.mine_id = m.id
      ORDER BY fr.submitted_at DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching field reports:", error);
    res.status(500).json({
      error: "Failed to fetch field reports"
    });
  }
});

export default router;

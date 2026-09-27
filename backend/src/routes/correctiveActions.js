import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET all corrective actions
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ca.id,
        ca.inspection_id,
        i.mine_id,
        m.name AS mine_name,
        ca.description,
        ca.due_date,
        ca.status
      FROM corrective_action ca
      LEFT JOIN inspection i ON ca.inspection_id = i.id
      LEFT JOIN mine m ON i.mine_id = m.id
      ORDER BY ca.due_date ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching corrective actions:", error);
    res.status(500).json({ error: "Failed to fetch corrective actions" });
  }
});

// GET one corrective action
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        ca.id,
        ca.inspection_id,
        i.mine_id,
        m.name AS mine_name,
        ca.description,
        ca.due_date,
        ca.status
      FROM corrective_action ca
      LEFT JOIN inspection i ON ca.inspection_id = i.id
      LEFT JOIN mine m ON i.mine_id = m.id
      WHERE ca.id = $1;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Corrective action not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching corrective action:", error);
    res.status(500).json({ error: "Failed to fetch corrective action" });
  }
});

// CREATE a corrective action
router.post("/", async (req, res) => {
  try {
    const { inspection_id, description, due_date, status } = req.body;

    if (!inspection_id || !description || !due_date) {
      return res.status(400).json({
        error: "inspection_id, description and due_date are required"
      });
    }

    const result = await pool.query(`
      INSERT INTO corrective_action
        (inspection_id, description, due_date, status)
      VALUES
        ($1, $2, $3, COALESCE($4, 'open'))
      RETURNING id, inspection_id, description, due_date, status;
    `, [inspection_id, description, due_date, status]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating corrective action:", error);
    res.status(500).json({ error: "Failed to create corrective action" });
  }
});

// UPDATE a corrective action
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, due_date, status } = req.body;

    if (!description || !due_date || !status) {
      return res.status(400).json({
        error: "description, due_date and status are required"
      });
    }

    const result = await pool.query(`
      UPDATE corrective_action
      SET
        description = $1,
        due_date = $2,
        status = $3
      WHERE id = $4
      RETURNING id, inspection_id, description, due_date, status;
    `, [description, due_date, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Corrective action not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating corrective action:", error);
    res.status(500).json({
      error: "Failed to update corrective action"
    });
  }
});

// DELETE a corrective action
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM corrective_action
      WHERE id = $1
      RETURNING id;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Corrective action not found"
      });
    }

    res.json({
      message: "Corrective action deleted successfully",
      id: result.rows[0].id
    });
  } catch (error) {
    console.error("Error deleting corrective action:", error);
    res.status(500).json({
      error: "Failed to delete corrective action"
    });
  }
});

export default router;

import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.id, n.notification_type, n.mine_id, m.name AS mine_name,
             n.message, n.created_at, n.read_at
      FROM notification n
      LEFT JOIN mine m ON m.id = n.mine_id
      ORDER BY n.created_at DESC
      LIMIT 50;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE notification SET read_at = COALESCE(read_at, now())
       WHERE id = $1 RETURNING id, read_at;`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

export default router;
const express = require("express");
const router = express.Router();
const pool = require("../../db"); // Assuming 'pool' is configured for MySQL connection

// Get plant IDs by user ID
router.get("/plants-by-user", async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT plant_id FROM Gsai_PlantUser WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No plants found for the given user ID" });
    }

    res.status(200).json({ plant_ids: rows.map((row) => row.plant_id) });
  } catch (error) {
    console.error("Error fetching plant IDs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

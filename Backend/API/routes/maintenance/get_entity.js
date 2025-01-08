const express = require("express");
const router = express.Router();
const pool = require("../../db"); // Assuming 'pool' is configured for MySQL connection

// Get entity details by EntityId
router.get("/entity", async (req, res) => {
  const entityId = req.query.entityid;

  if (!entityId) {
    return res.status(400).json({ message: "EntityId is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM EntityMaster WHERE entityid = ?",
      [entityId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Entity not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching entity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

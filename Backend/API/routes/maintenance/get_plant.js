const express = require("express");
const router = express.Router();
const pool = require("../../db"); // Assuming 'pool' is configured for MySQL connection

// Get plant details by plant_id
router.get("/plant", async (req, res) => {
  const plantId = req.query.plant_id;

  if (!plantId) {
    return res.status(400).json({ message: "Plant ID is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM Gsai_PlantMaster WHERE plant_id = ?",
      [plantId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Plant not found" });
    }

    res.status(200).json(rows[0]); // Returns the record as a JSON object
  } catch (error) {
    console.error("Error fetching plant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

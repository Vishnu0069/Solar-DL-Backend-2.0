const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();
const auth = require("../../middleware/auth");

router.post("/enablePlant", auth, async (req, res) => {
  const { plant_id } = req.body;

  // Validate input
  if (!plant_id) {
    return res.status(400).json({ message: "plant_id is required" });
  }

  try {
    // Check if the plant exists and is currently disabled
    const [checkPlant] = await pool.query(
      `
      SELECT * 
      FROM Gsai_PlantMaster  
      WHERE plant_id = ? AND marked_deletion = 1
      `,
      [plant_id]
    );

    if (checkPlant.length === 0) {
      return res
        .status(404)
        .json({ message: "Plant not found or is already enabled" });
    }

    // Update the marked_deletion flag to 0
    const [updateResult] = await pool.query(
      `
      UPDATE  Gsai_PlantMaster 
      SET marked_deletion = 0 
      WHERE plant_id = ?
      `,
      [plant_id]
    );

    if (updateResult.affectedRows > 0) {
      return res
        .status(200)
        .json({ message: `Plant ${plant_id} enabled successfully` });
    } else {
      return res.status(500).json({ message: "Failed to enable the plant" });
    }
  } catch (error) {
    console.error("Error enabling plant:", error);
    res.status(500).json({
      message: "Error enabling plant",
      error: error.message,
    });
  }
});

module.exports = router;

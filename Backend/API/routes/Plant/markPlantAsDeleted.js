// In routes/Plant/markPlantAsDeleted.js
const express = require("express");
const pool = require("../../db");
const router = express.Router();
const auth = require("../../middleware/auth");

router.post("/disable", auth, async (req, res) => {
  const { plant_id } = req.body;

  if (!plant_id) {
    return res.status(400).json({ message: "plant_id is required" });
  }

  try {
    // Check if the plant exists
    const [checkResult] = await pool.query(
      `SELECT plant_id FROM Gsai_PlantMaster WHERE plant_id = ?`,
      [plant_id]
    );

    if (checkResult.length === 0) {
      return res.status(404).json({ message: "Plant not found" });
    }

    // Mark the plant as deleted
    const [result] = await pool.query(
      `UPDATE Gsai_PlantMaster 
       SET marked_deletion = 1 
       WHERE plant_id = ?`,
      [plant_id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Plant not found or already marked as deleted" });
    }

    res.status(200).json({ message: "Plant marked as deleted successfully" });
  } catch (error) {
    console.error("Error marking plant as deleted:", error);
    res
      .status(500)
      .json({
        message: "Error marking plant as deleted",
        error: error.message,
      });
  }
});

module.exports = router;

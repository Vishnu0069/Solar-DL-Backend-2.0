const express = require("express");
const pool = require("../../db");
const router = express.Router();
const auth = require("../../middleware/auth");

router.get("/entity_details3", auth, async (req, res) => {
  const { country } = req.query;

  if (!country) {
    return res.status(400).json({ message: "Country parameter is required" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT * 
      FROM EntityMaster 
      WHERE mark_deletion = 0 AND country = ?
    `,
      [country]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No active entities found in the specified country" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching entity details by country:", error);
    res
      .status(500)
      .json({
        message: "Error fetching entity details by country",
        error: error.message,
      });
  }
});

module.exports = router;

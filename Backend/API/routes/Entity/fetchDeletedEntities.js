const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

router.get("/fetchDeletedEntities", async (req, res) => {
  const { entityid } = req.query;

  // Validate the input
  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    // Query to fetch records where masterentityid matches and mark_deletion is set to 1
    const [rows] = await pool.query(
      `
      SELECT * 
      FROM EntityMaster 
      WHERE masterentityid = ? AND mark_deletion = 1
      `,
      [entityid]
    );

    // Check if there are any matching records
    if (rows.length === 0) {
      return res
        .status(404)
        .json({
          message:
            "No records found for the given entityid with mark_deletion set to 1",
        });
    }

    // Respond with the fetched data
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching deleted entities:", error);
    res
      .status(500)
      .json({
        message: "Error fetching deleted entities",
        error: error.message,
      });
  }
});

module.exports = router;

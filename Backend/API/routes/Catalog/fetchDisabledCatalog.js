const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

router.post("/fetchDisabledCatalog", async (req, res) => {
  const { entityid } = req.body;

  if (!entityid) {
    return res.status(400).json({ message: "Entity ID is required" });
  }

  try {
    const [results] = await pool.query(
      `
      SELECT catalogId, make, deviceType, targetFields,sourceFields,summaryFields,aggregates,deviceVersion, deviceModel, delete_flag
      FROM fetchCatalog
      WHERE entityid = ? AND delete_flag = 03
      `,
      [entityid] // Pass the entityid to the query
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "No disabled catalogs found" });
    }

    // Return the list of disabled catalogs
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching disabled catalogs:", error);
    res.status(500).json({
      message: "Error fetching disabled catalogs",
      error: error.message,
    });
  }
});

module.exports = router;

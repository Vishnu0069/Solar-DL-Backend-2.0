const express = require("express");
const router = express.Router();
const pool = require("../../db");
require("dotenv").config();

// Route to fetch active catalogs (POST request)
router.post("/fetchCatalog", async (req, res) => {
  try {
    const { entityid } = req.body; // Getting entityid from the body

    // Validate input
    if (!entityid) {
      return res.status(400).json({ error: "Entity ID is required" });
    }

    const query =
      "SELECT catalogId, make, deviceType, targetFields, sourceFields, summaryFields, aggregates, deviceVersion, deviceModel, delete_flag " +
      "FROM fetchCatalog WHERE entityid = ? AND delete_flag = 0"; // Fetch only active records excluding entityid
    const [results] = await pool.query(query, [entityid]); // Await the query execution

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching catalogs:", error.message);
    res.status(500).json({ error: "Failed to fetch catalogs" });
  }
});

module.exports = router;

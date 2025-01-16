const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

// Route to fetch headers from the GSAI_TargetFields table
router.get("/fetchHeaders", async (req, res) => {
  try {
    const query = "SELECT header FROM gsai_targetfields"; // Query to fetch headers
    const [results] = await pool.query(query);

    if (results.length === 0) {
      return res.status(404).json({ message: "No headers found" });
    }

    // Extracting only the headers as plain values
    const headers = results.map((row) => row.header);

    res.status(200).json(headers);
  } catch (error) {
    console.error("Error fetching headers:", error);
    res.status(500).json({
      message: "Error fetching headers",
      error: error.message,
    });
  }
});

module.exports = router;

const express = require("express");
const pool = require("../../db"); // Assuming the database connection is set up in db.js
const router = express.Router();

router.get("/getOtherDevices", async (req, res) => {
  try {
    // Query to fetch all devices from the Other_Devices table
    const [rows] = await pool.query(
      `SELECT device_id, device_name FROM Other_Devices`
    );

    res.status(200).json({
      devices: rows, // Send the devices as an array
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({
      message: "Error fetching devices",
      error: error.message,
    });
  }
});

module.exports = router;

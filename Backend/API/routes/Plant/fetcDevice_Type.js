const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

router.post("/getDeviceTypes", async (req, res) => {
  try {
    // Query to fetch all device types
    const [rows] = await pool.query(
      `
      SELECT 
        device_typeid AS "Device Type ID",
        device_name AS "Device Name"
      FROM Device_Type
      `
    );

    // Check if there are any device types
    if (rows.length === 0) {
      return res.status(404).json({ message: "No device types found" });
    }

    // Respond with the fetched data
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching device types:", error);
    res.status(500).json({
      message: "Error fetching device types",
      error: error.message,
    });
  }
});

module.exports = router;

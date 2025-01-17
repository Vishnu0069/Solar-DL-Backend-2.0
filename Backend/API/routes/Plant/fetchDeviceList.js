const express = require("express");
const pool = require("../../db");
const router = express.Router();
require("dotenv").config();
const auth = require("../../middleware/auth");

router.get("/fetchDeviceList", auth, async (req, res) => {
  const { plant_id } = req.query;

  // Validate query parameters
  if (!plant_id) {
    return res.status(400).json({ message: "plant_id parameter is required" });
  }

 /* try {
    // SQL query to fetch device list
    const query = `
      SELECT 
        dm.device_id AS "Device ID",
        dm.master_device_id AS "Master Device ID",
        dt.Device_type AS "Device Type",
        dm.make AS "Make",
        dm.model AS "Model",
        dm.Rating AS "Rating",
        dm.Quantity AS "Quantity",
        dm.Serial_Nos AS "Serial Numbers",
        dm.create_date AS "Creation Date",
        dm.last_update_date AS "Last Update Date",
        dm.Plant_id AS "Plant ID",
        dm.System_date_time AS "System Date-Time"
      FROM 
        gsai_device_master dm
      LEFT JOIN 
        gsai_device_types dt ON dm.device_type_id = dt.Device_type_id
      WHERE 
        dm.Plant_id = ?;
    `;*/

    try {
        // SQL query to fetch the limited fields
        const query = `
                    SELECT 
            dm.device_type_id AS "Device Type",
            dm.make AS "Make",
            dm.model AS "Model",
            dm.Rating AS "Rating",
            dm.Quantity AS "Quantity",
            dm.Serial_Nos AS "Serial Numbers"
            FROM 
            gsai_device_master dm
            WHERE 
            dm.Plant_id = ?
        `;

    // Execute the query
    const [rows] = await pool.query(query, [plant_id]);

    // If no devices are found, return 404
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No devices found for the given plant_id" });
    }

    // Return the list of devices
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching device list:", error);
    res.status(500).json({
      message: "Error fetching device list",
      error: error.message,
    });
  }
});

module.exports = router;

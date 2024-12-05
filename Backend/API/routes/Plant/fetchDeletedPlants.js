const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

router.get("/fetchDisabledPlants", async (req, res) => {
  const { entityid } = req.query;

  // Validate input
  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    // Query to fetch disabled plants under the given entityid
    const [rows] = await pool.query(
      `
      SELECT 
        plant_id AS "Plant ID",
        plant_name AS "Plant Name",
        plant_type AS "Plant Type",
        plant_category AS "Plant Category",
        capacity AS "Capacity",
        capacity_unit AS "Capacity Unit",
        country AS "Country",
        region AS "Region",
        state AS "State",
        district AS "District",
        pincode AS "Pincode",
        longitude AS "Longitude",
        latitude AS "Latitude",
        install_date AS "Install Date",
        azimuth_angle AS "Azimuth Angle",
        tilt_angle AS "Tilt Angle",
        owner_first_name AS "Owner First Name",
        owner_last_name AS "Owner Last Name",
        owner_email AS "Owner Email"
      FROM  Gsai_PlantMaster
      WHERE entityid = ? AND marked_deletion = 1
      `,
      [entityid]
    );

    // Check if there are any matching plants
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No disabled plants found for the given entityid" });
    }

    // Respond with the formatted data
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching disabled plants:", error);
    res.status(500).json({
      message: "Error fetching disabled plants",
      error: error.message,
    });
  }
});

module.exports = router;

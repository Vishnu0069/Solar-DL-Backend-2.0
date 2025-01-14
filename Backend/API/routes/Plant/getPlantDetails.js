// const express = require("express");
// const pool = require("../../db"); // Ensure this points to your database connection file
// const router = express.Router();

// router.get("/getPlantDetails", async (req, res) => {
//   const { plant_id } = req.query;

//   // Validate input
//   if (!plant_id) {
//     return res.status(400).json({ message: "plant_id parameter is required" });
//   }

//   try {
//     // Query to fetch all details for the given plant_id
//     const [rows] = await pool.query(
//       `
//       SELECT
//         plant_id AS "Plant ID",
//         plant_name AS "Plant Name",
//         plant_type AS "Plant Type",
//         plant_category AS "Plant Category",
//         capacity AS "Capacity",
//         capacity_unit AS "Capacity Unit",
//         country AS "Country",
//         region AS "Region",
//         state AS "State",
//         district AS "District",
//         pincode AS "Pincode",
//         longitude AS "Longitude",
//         latitude AS "Latitude",
//         install_date AS "Install Date",
//         azimuth_angle AS "Azimuth Angle",
//         tilt_angle AS "Tilt Angle",
//         owner_first_name AS "Owner First Name",
//         owner_last_name AS "Owner Last Name",
//         owner_email AS "Owner Email"
//       FROM Gsai_PlantMaster
//       WHERE plant_id = ?
//       `,
//       [plant_id]
//     );

//     // Check if the plant exists
//     if (rows.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "Plant not found for the given plant_id" });
//     }

//     // Respond with the plant details
//     res.status(200).json(rows[0]);
//   } catch (error) {
//     console.error("Error fetching plant details:", error);
//     res.status(500).json({
//       message: "Error fetching plant details",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;
//below is the one with exact same feilds as in add-plant
const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();
const auth = require("../../middleware/auth");

router.get("/getPlantDetails", auth, async (req, res) => {
  const { plant_id } = req.query;

  // Validate input
  if (!plant_id) {
    return res.status(400).json({ message: "plant_id parameter is required" });
  }

  try {
    // Query to fetch all details for the given plant_id
    const [rows] = await pool.query(
      `
      SELECT 
        plant_id AS "Plant ID",
        entityid AS "Entity ID",
        plant_name AS "Plant Name",
        install_date AS "Install Date",
        azimuth_angle AS "Azimuth Angle",
        tilt_angle AS "Tilt Angle",
        plant_type AS "Plant Type",
        plant_category AS "Plant Category",
        capacity AS "Capacity",
        capacity_unit AS "Capacity Unit",
        country AS "Country",
        region AS "Region",
        state AS "State",
        district AS "District",
        address_line1 AS "Address Line 1",
        address_line2 AS "Address Line 2",
        pincode AS "Pincode",
        longitude AS "Longitude",
        latitude AS "Latitude",
      
        owner_first_name AS "Owner First Name",
        owner_last_name AS "Owner Last Name",
        owner_email AS "Owner Email",
        mobileno AS "Mobile Number",
        entityname AS "Entity Name",
        yield_value AS "Yield Value",       
        currency AS "Currency",          
        timezone AS "Time zone"   
      FROM Gsai_PlantMaster
      WHERE plant_id = ?
      `,
      [plant_id]
    );

    // Check if plant exists
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Plant not found for the given plant_id" });
    }

    // Respond with the plant details
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching plant details:", error);
    res.status(500).json({
      message: "Error fetching plant details",
      error: error.message,
    });
  }
});

module.exports = router;

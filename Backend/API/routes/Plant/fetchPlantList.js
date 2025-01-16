const express = require("express");
const pool = require("../../db");
const router = express.Router();
require("dotenv").config();
const auth = require("../../middleware/auth");

router.get("/fetchPlantList", auth, async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    const query = `
      SELECT 
        pm.plant_id AS "Plant ID",
        pm.plant_name AS "Plant Name",
        pm.plant_type AS "Plant Type",
        pm.plant_category AS "Plant Category",
        pm.capacity AS "Capacity",
        pm.capacity_unit AS "Capacity Unit",
        pm.country AS "Country",
        pm.region AS "Region",
        pm.state AS "State",
        pm.district AS "District",
        pm.pincode AS "Pincode",
        pm.longitude AS "Longitude",
        pm.latitude AS "Latitude",
        pm.install_date AS "Install Date",
        pm.azimuth_angle AS "Azimuth Angle",
        pm.tilt_angle AS "Tilt Angle",
        pm.owner_first_name AS "Owner First Name",
        pm.owner_last_name AS "Owner Last Name",
        pm.owner_email AS "Owner Email",
        pm.mobileno AS "Mobile Number",
        em.entityname AS "Entity Name",
        CASE 
          WHEN gpu.plant_id IS NOT NULL THEN 'Assigned'
          ELSE 'Unassigned'
        END AS "Assignment Status"
      FROM 
        Gsai_PlantMaster pm
      LEFT JOIN 
        Gsai_PlantUser gpu ON pm.plant_id = gpu.plant_id
      LEFT JOIN 
        EntityMaster em ON pm.entityid = em.entityid
      WHERE 
        pm.entityid = ?;
    `;

    const [rows] = await pool.query(query, [entityid]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No plants found for the given entityid" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching plant list:", error);
    res.status(500).json({
      message: "Error fetching plant list",
      error: error.message,
    });
  }
});

module.exports = router;

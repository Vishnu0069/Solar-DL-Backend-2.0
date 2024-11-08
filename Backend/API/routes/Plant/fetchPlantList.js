const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/fetchPlantList', async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: 'entityid parameter is required' });
  }

  try {
    let query;
    let params;

    if (entityid.includes('-')) {
      // If entityid includes a suffix (e.g., 'LIFELINK-1003'), fetch details for that specific plant
      query = `
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
        FROM Gsai_PlantMaster
        WHERE plant_id = ? AND marked_deletion = 0  -- Exclude records marked for deletion
      `;
      params = [entityid];
    } else {
      // If entityid has no suffix, fetch all plants for the base entity
      query = `
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
        FROM Gsai_PlantMaster
        WHERE entityid = ? AND marked_deletion = 0  -- Exclude records marked for deletion
      `;
      params = [entityid];
    }

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching plant list:', error);
    res.status(500).json({ message: 'Error fetching plant list', error: error.message });
  }
});

module.exports = router;

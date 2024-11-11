const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/Get_Plant_details1', async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: 'entityid parameter is required' });
  }

  try {
    const [plantRows] = await pool.query(
      `SELECT plant_id AS plantId, plant_name AS plantName, install_date AS installDate, 
              azimuth_angle AS azimuthAngle, tilt_angle AS tiltAngle, plant_type AS plantType,
              plant_category AS plantCategory, capacity, capacity_unit AS capacityUnit, 
              country, region, state, district, owner_first_name AS ownerFirstName, 
              owner_last_name AS ownerLastName, owner_email AS ownerEmail
       FROM Gsai_PlantMaster
       WHERE entityid = ? AND marked_deletion = 0`, // Exclude records marked for deletion
      [entityid]
    );

    if (plantRows.length === 0) {
      return res.status(404).json({ message: 'No plants found for the specified entity ID' });
    }

    res.status(200).json(plantRows);
  } catch (error) {
    console.error('Error fetching plant details:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

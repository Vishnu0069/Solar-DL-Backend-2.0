const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/Get_Plant_details3', async (req, res) => {
  const { district } = req.query;

  if (!district) {
    return res.status(400).json({ message: 'District parameter is required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
          plant_id AS plantId,
          plant_name AS plantName,
          install_date AS installDate,
          azimuth_angle AS azimuthAngle,
          tilt_angle AS tiltAngle,
          plant_type AS plantType,
          plant_category AS plantCategory,
          capacity,
          capacity_unit AS capacityUnit,
          country,
          region,
          state,
          district,
          owner_first_name AS ownerFirstName,
          owner_last_name AS ownerLastName,
          owner_email AS ownerEmail
       FROM Gsai_PlantMaster
       WHERE district = ? AND marked_deletion = 0`,
      [district]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No plants found for the specified district' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching plant details by district:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

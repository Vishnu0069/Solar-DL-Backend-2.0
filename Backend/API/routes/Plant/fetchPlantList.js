const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/fetchPlantList', async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: 'entityid parameter is required' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        plant_name AS "Plant Name",
        plant_type AS "Plant Type",
        CONCAT(capacity, ' ', capacity_unit) AS "Capacity",
        "Peak Power" AS "Peak Power",  -- Placeholder, replace as needed
        district AS "District",
        "alerts" AS "Alerts",            -- Assuming there's an alerts column in the table
        "status" AS "Status"             -- Assuming there's a status column in the table
      FROM Gsai_PlantMaster
      WHERE entityid = ?
    `, [entityid]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching plant list:', error);
    res.status(500).json({ message: 'Error fetching plant list', error: error.message });
  }
});

module.exports = router;

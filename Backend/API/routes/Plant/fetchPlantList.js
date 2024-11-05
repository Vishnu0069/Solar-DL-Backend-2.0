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
        plant_id AS "Plant ID",              
        plant_name AS "Plant Name",
        plant_type AS "Plant Type",
        CONCAT(capacity, ' ', capacity_unit) AS "Capacity",
        "Peak Power" AS "Peak Power",        
        district AS "District",
        "alerts" AS "Alerts",                
        "status" AS "Status"                 
      FROM Gsai_PlantMaster
      WHERE entityid = ? AND marked_deletion = 0  -- Exclude records marked for deletion
    `, [entityid]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching plant list:', error);
    res.status(500).json({ message: 'Error fetching plant list', error: error.message });
  }
});

module.exports = router;

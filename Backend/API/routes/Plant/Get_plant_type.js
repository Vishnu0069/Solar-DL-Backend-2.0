const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/getPlantTypes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT type_id, type_name FROM Gsai_PlantType');
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching plant types:', error);
    res.status(500).json({ message: 'Error fetching plant types', error: error.message });
  }
});

module.exports = router;

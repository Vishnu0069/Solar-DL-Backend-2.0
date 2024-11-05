// In routes/Plant/generatePlantId.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/generatePlantId', async (req, res) => {
  const { entityid } = req.body;

  if (!entityid) {
    return res.status(400).json({ message: 'entityid is required' });
  }

  try {
    // Remove any suffix after the last dash in entityid
    const prefix = entityid.split('-')[0];
    let suffix = 1001;
    let newPlantId;

    while (true) {
      newPlantId = `${prefix}-P-${suffix}`;

      // Check if this plant_id already exists in the database
      const [rows] = await pool.query(
        'SELECT plant_id FROM Gsai_PlantMaster WHERE plant_id = ?',
        [newPlantId]
      );

      if (rows.length === 0) break;

      suffix += 1;
    }

    res.status(200).json({ plant_id: newPlantId });
  } catch (error) {
    console.error('Error generating plant ID:', error);
    res.status(500).json({ message: 'Error generating plant ID', error: error.message });
  }
});

module.exports = router;

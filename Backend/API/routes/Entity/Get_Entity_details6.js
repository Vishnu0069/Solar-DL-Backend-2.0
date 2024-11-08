const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/get_entity_details6', async (req, res) => {
  const { country, state, district } = req.query;

  if (!country || !state || !district) {
    return res.status(400).json({ message: 'country, state, and district parameters are required' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM EntityMaster 
      WHERE mark_deletion = 0 AND country = ? AND state = ? AND district = ?
    `, [country, state, district]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No active entities found for the specified country, state, and district' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching entity details by country, state, and district:', error);
    res.status(500).json({ message: 'Error fetching entity details', error: error.message });
  }
});

module.exports = router;

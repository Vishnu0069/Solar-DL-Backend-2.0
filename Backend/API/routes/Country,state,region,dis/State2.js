// In routes/Region/fetchStatesByCountryAndRegion.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/state2', async (req, res) => {
  const { country_id, region } = req.query;

  if (!country_id || !region) {
    return res.status(400).json({ message: 'country_id and region parameters are required' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT state_name 
      FROM state 
      WHERE country_id = ? AND region = ?
    `, [country_id, region]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No states found for the specified country_id and region' });
    }

    res.status(200).json({ states: rows });
  } catch (error) {
    console.error('Error fetching states by country and region:', error);
    res.status(500).json({ message: 'Error fetching states by country and region', error: error.message });
  }
});

module.exports = router;

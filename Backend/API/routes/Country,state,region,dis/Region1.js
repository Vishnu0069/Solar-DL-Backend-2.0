// In routes/Region/fetchRegionsByCountry.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/Region1', async (req, res) => {
  const { country_id } = req.query;

  if (!country_id) {
    return res.status(400).json({ message: 'country_id parameter is required' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT region
      FROM state
      WHERE country_id = ?
    `, [country_id]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ message: 'Error fetching regions', error: error.message });
  }
});

module.exports = router;

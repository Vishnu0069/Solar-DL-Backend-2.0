// In routes/Region/fetchRegionByState.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/Region2', async (req, res) => {
  const { country_id, state_name } = req.query;

  if (!country_id || !state_name) {
    return res.status(400).json({ message: 'country_id and state_name parameters are required' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT region 
      FROM state 
      WHERE country_id = ? AND state_name = ?
    `, [country_id, state_name]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No region found for the specified country_id and state_name' });
    }

    res.status(200).json(rows[0]); // Returning the single region found
  } catch (error) {
    console.error('Error fetching region by state:', error);
    res.status(500).json({ message: 'Error fetching region by state', error: error.message });
  }
});

module.exports = router;

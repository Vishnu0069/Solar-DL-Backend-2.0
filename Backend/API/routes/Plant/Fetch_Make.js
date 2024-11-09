const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/fetchMakes', async (req, res) => {
  try {
    // Fetch make_id and make_name for the dropdown options
    const [rows] = await pool.query('SELECT make_id, make_name FROM Gsai_Make');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching makes:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

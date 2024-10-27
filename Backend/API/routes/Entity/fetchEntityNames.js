// In routes/Entity/fetchEntityNames.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/fetchEntityNames', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT entityname FROM EntityMaster');
    res.status(200).json(rows.map(row => row.entityname));
  } catch (error) {
    console.error('Error fetching entity names:', error);
    res.status(500).json({ message: 'Error fetching entity names', error: error.message });
  }
});

module.exports = router;

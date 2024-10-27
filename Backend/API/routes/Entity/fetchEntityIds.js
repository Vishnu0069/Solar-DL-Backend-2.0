// In routes/Entity/fetchEntityIds.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/fetchEntityIds', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT entityid FROM EntityMaster');
    res.status(200).json(rows.map(row => row.entityid));
  } catch (error) {
    console.error('Error fetching entity IDs:', error);
    res.status(500).json({ message: 'Error fetching entity IDs', error: error.message });
  }
});

module.exports = router;

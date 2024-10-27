// In routes/Entity/fetchEntityById.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/fetchEntity', async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: 'Please provide a search query (entityid or entityname).' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM EntityMaster WHERE entityid = ? OR entityname = ?', [search, search]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Entity not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching entity:', error);
    res.status(500).json({ message: 'Error fetching entity', error: error.message });
  }
});

module.exports = router;

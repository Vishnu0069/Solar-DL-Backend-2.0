// fetchEntities.js
const express = require('express');
const pool = require('../../db'); // Adjust this path if necessary
const router = express.Router(); // Initialize router


router.get('/fetchEntities', async (req, res) => {
  const { search } = req.query;

  let query = 'SELECT entityid, entityname, address_line_1, address_line_2 FROM EntityMaster';
  const params = [];

  if (search) {
    query += ' WHERE entityid = ? OR entityname = ?';
    params.push(search, search);
  }

  try {
    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ message: 'Error fetching entities', error: error.message });
  }
});
module.exports = router;

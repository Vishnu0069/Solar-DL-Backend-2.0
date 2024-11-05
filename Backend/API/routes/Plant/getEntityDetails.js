// In routes/Entity/getEntityDetails.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/getEntityDetails', async (req, res) => {
  const { entityname } = req.query;

  if (!entityname) {
    return res.status(400).json({ message: 'entityname parameter is required' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT entityid, category, email 
      FROM EntityMaster 
      WHERE entityname = ?
    `, [entityname]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching entity details:', error);
    res.status(500).json({ message: 'Error fetching entity details', error: error.message });
  }
});

module.exports = router;

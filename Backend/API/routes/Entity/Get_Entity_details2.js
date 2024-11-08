const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/get_entity_details2', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email parameter is required' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM EntityMaster 
      WHERE mark_deletion = 0 AND email = ?
    `, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No active entity found with the provided email' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching entity details:', error);
    res.status(500).json({ message: 'Error fetching entity details', error: error.message });
  }
});

module.exports = router;

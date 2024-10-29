// In routes/Entity/generateEntityId.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/generateEntityId', async (req, res) => {
  const { masterentityid } = req.body;

  if (!masterentityid) {
    return res.status(400).json({ message: 'masterentityid is required' });
  }

  try {
    // Remove the suffix after the last dash in masterentityid to get the base prefix
    const prefix = masterentityid.split('-').slice(0, -1).join('-');

    // Query to find the latest entityid associated with the given masterentityid prefix
    const [rows] = await pool.query(`
      SELECT entityid 
      FROM EntityMaster 
      WHERE entityid LIKE CONCAT(?, '-%')
      ORDER BY CAST(SUBSTRING(entityid, LOCATE('-', entityid, LOCATE('-', entityid) + 1) + 1) AS UNSIGNED) DESC 
      LIMIT 1
    `, [prefix]);

    let newEntityId;
    if (rows.length > 0) {
      // Increment the suffix based on the last entityid found
      const lastEntityId = rows[0].entityid;
      const lastNumber = parseInt(lastEntityId.split('-').pop(), 10);
      newEntityId = `${prefix}-${lastNumber + 1}`;
    } else {
      // Start with 1001 if no existing entityid is found
      newEntityId = `${prefix}-1001`;
    }

    res.status(200).json({ entityid: newEntityId });
  } catch (error) {
    console.error('Error generating entity ID:', error);
    res.status(500).json({ message: 'Error generating entity ID', error: error.message });
  }
});

module.exports = router;

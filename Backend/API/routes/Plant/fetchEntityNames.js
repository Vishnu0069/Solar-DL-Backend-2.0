// In routes/Entity/fetchEntityNames.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/fetchEntityNames', async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: 'entityid parameter is required' });
  }

  try {
    // Check if the masterentityid of the given entityid is '1111'
    const [entityCheck] = await pool.query(`
      SELECT masterentityid 
      FROM EntityMaster 
      WHERE entityid = ?
    `, [entityid]);

    if (entityCheck.length === 0) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    const masterEntityId = entityCheck[0].masterentityid;

    let query;
    let params;

    if (masterEntityId === '1111') {
      // If masterentityid is '1111', get all entities with the same prefix as the provided entityid
      query = `
        SELECT entityid, entityname 
        FROM EntityMaster 
        WHERE entityid LIKE CONCAT(?, '-%')
      `;
      params = [entityid];
    } else {
      // If masterentityid is not '1111', return only that specific entity
      query = `
        SELECT entityid, entityname 
        FROM EntityMaster 
        WHERE entityid = ?
      `;
      params = [entityid];
    }

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching entity names:', error);
    res.status(500).json({ message: 'Error fetching entity names', error: error.message });
  }
});

module.exports = router;

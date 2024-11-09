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
    // Fetch the masterentityid and entityname for the given entityid
    const [entityCheck] = await pool.query(`
      SELECT masterentityid, entityname 
      FROM EntityMaster 
      WHERE entityid = ?
    `, [entityid]);

    if (entityCheck.length === 0) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    const { masterentityid: masterEntityId, entityname: currentEntityName } = entityCheck[0];

    let query;
    let params;

    if (masterEntityId === '1111') {
      // If masterentityid is '1111', get all entities with the same prefix as the provided entityid
      query = `
        SELECT entityid, entityname 
        FROM EntityMaster 
        WHERE entityid LIKE CONCAT(?, '-%') AND mark_deletion = 0
      `;
      params = [entityid];
    } else {
      // If masterentityid is not '1111', return only that specific entity
      query = `
        SELECT entityid, entityname 
        FROM EntityMaster 
        WHERE entityid = ? AND mark_deletion = 0
      `;
      params = [entityid];
    }

    const [rows] = await pool.query(query, params);

    // Add the current entity information to the response
    const response = {
      currentEntity: { entityid, entityname: currentEntityName },
      entities: rows
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching entity names:', error);
    res.status(500).json({ message: 'Error fetching entity names', error: error.message });
  }
});

module.exports = router;

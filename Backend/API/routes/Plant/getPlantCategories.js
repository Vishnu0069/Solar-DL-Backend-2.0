const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/getPlantCategories', async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: 'entityid parameter is required' });
  }

  try {
    // Get the country associated with the entityid from EntityMaster
    const [entityRows] = await pool.query(`
      SELECT country 
      FROM EntityMaster 
      WHERE entityid = ?
    `, [entityid]);

    if (entityRows.length === 0) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    const country = entityRows[0].country;

    // Fetch categories based on the country
    const [categories] = await pool.query(`
      SELECT category_name 
      FROM Plant_Category 
      WHERE country = ?
    `, [country]);

    res.status(200).json({ country, categories });
  } catch (error) {
    console.error('Error fetching plant categories:', error);
    res.status(500).json({ message: 'Error fetching plant categories', error: error.message });
  }
});

module.exports = router;

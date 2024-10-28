const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/regions', async (req, res) => {
    try {
        const [regions] = await pool.query('SELECT region_id, region_name FROM region');
        res.status(200).json(regions);
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

const express = require('express');
const pool = require('../../db'); // Database connection
const router = express.Router();

router.post('/countries', async (req, res) => {
    try {
        const [countries] = await pool.query('SELECT country_id, country_name FROM country');
        res.status(200).json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

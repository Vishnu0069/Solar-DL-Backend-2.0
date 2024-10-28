const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/states/:countryId', async (req, res) => {
    const { countryId } = req.params;
    try {
        const [states] = await pool.query('SELECT state_id, state_name FROM state WHERE country_id = ?', [countryId]);
        res.status(200).json(states);
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

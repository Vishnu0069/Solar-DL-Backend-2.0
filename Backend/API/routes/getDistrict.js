const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/districts/:stateId', async (req, res) => {
    const { stateId } = req.params;
    try {
        const [districts] = await pool.query('SELECT district_id, district_name FROM district WHERE state_id = ?', [stateId]);
        res.status(200).json(districts);
    } catch (error) {
        console.error('Error fetching districts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

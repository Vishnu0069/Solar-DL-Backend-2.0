const express = require('express');
const router = express.Router();
const connection = require('../db/database');

router.post('/PlantCount', (req, res) => {
    const { IntegratorID } = req.body;

    const query = 'SELECT COUNT(PlantID) AS PlantCount FROM PlantMaster WHERE IntegratorID = ?';
    
    connection.query(query, [IntegratorID], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error');
        }
        res.json({ PlantCount: results[0].PlantCount });
    });
});

module.exports = router;

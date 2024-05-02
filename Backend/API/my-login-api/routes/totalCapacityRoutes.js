const express = require('express');
const router = express.Router();
const connection = require('../db/database'); // Make sure this path is correct

// Route to get total capacity for a specific IntegratorID
router.post('/totalCapacity', (req, res) => {
    const { userData } = req.body;
    const { integratorid } = userData;

    const query = `
        SELECT SUM(Capacity) AS TotalCapacity
        FROM PlantMaster
        WHERE IntegratorID = ?;
    `;

    connection.query(query, [integratorid], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send('Internal server error');
            return;
        }
        // Ensure that there's a result and that it's not null
        const totalCapacity = results[0].TotalCapacity || 0;
        res.json({ TotalCapacity: totalCapacity });
    });
});

module.exports = router;

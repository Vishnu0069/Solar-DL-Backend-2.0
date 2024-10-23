const express = require('express');
const router = express.Router();
const connection = require('../config/database');

// Middleware to parse JSON request bodies
router.use(express.json());

// Route to get unique system types by integrator ID
router.post('/system-types', (req, res) => {
    const integratorId = req.body.userData.integratorid;
    if (!integratorId) {
        res.status(400).send('Integrator ID is required');
        return;
    }

    const query = `
        SELECT DISTINCT SystemType
        FROM PlantMaster
        WHERE IntegratorID = ?;
    `;

    connection.query(query, [integratorId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send('Internal server error');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('No system types found for the provided integrator ID');
            return;
        }
        res.json(results);
    });
});

module.exports = router;

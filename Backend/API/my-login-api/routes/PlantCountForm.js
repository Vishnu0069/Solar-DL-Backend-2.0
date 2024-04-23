const express = require('express');
const router = express.Router();
const connection = require('../db/database'); // Ensure this import points to your configured database connection

// Route to get plant count for a specific IntegratorID
router.post('/plantCount', (req, res) => {
    const { IntegratorID } = req.body;
    
    const query = `
        SELECT COUNT(plantid) AS PlantCount
        FROM PlantMaster
        WHERE IntegratorID = ?;
    `;

    connection.query(query, [IntegratorID], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send('Internal server error');
            return;
        }
        if (results.length > 0) {
            res.json({ TotalPlants: results[0].PlantCount });
        } else {
            res.json({ TotalPlants: 0 });
        }
    });
});

module.exports = router;

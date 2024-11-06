const express = require('express');
const router = express.Router();
const connection = require('../../db/index'); // Ensure this path correctly points to your configured database connection module

// Route to get district names by record number
router.post('/districts', (req, res) => {
    const loc_id = req.body.loc_id;
    if (!loc_id) {
        res.status(400).send('loc_id is required');
        return;
    }

    const query = `
        SELECT District_County_Name AS DistrictName
        FROM District_County
        WHERE loc_id = ?;
    `;


    connection.query(query, [loc_id], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).send('Internal server error');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('No districts found for the provided record number');
            return;
        }
        res.json(results);
    });
});

module.exports = router;

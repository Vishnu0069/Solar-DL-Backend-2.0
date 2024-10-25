const express = require('express');
const router = express.Router();
const connection = require('../db/index'); // Ensure this path correctly points to your configured database connection module

// Route to get state data and record numbers
router.get('/states', (req, res) => {
    const countryName = process.env.COUNTRY; // Get the country name from environment variables

    // Updated SQL query to select state names and their minimum loc_id from the CountryMaster table for a specific country
    const query = `
        SELECT MIN(loc_id) AS loc_id, State_Name AS StateName
        FROM CountryMaster
        WHERE Country = ?
        GROUP BY State_Name
        ORDER BY State_Name;
    `;

    // Execute the query
    connection.query(query, [countryName], (err, results) => {
        if (err) {
            // Log and send a server error response if the query fails
            console.error('Database query error:', err);
            res.status(500).send('Internal server error');
            return;
        }
        // Send the response back to the client
        res.json(results);
    });
});

module.exports = router;

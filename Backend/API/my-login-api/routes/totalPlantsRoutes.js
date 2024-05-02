// Start of code block

// Import necessary modules and setup the Express router
// Express for routing, and a custom module for database connectivity
// Written by Vishnu Prasad S
// Written on Date 30-04-2024
const express = require('express');
const router = express.Router();
const connection = require('../db/database');

// Define a POST route to get the count of plants for a specific IntegratorID
// This route expects a POST request with IntegratorID in the request body
// Written by Vishnu Prasad S
// Written on Date 30-04-2024
router.post('/PlantCountD', (req, res) => {
    const { IntegratorID } = req.body;

    // SQL query to count the number of plants associated with the specified IntegratorID
    const query = 'SELECT COUNT(PlantID) AS PlantCount FROM PlantMaster WHERE IntegratorID = ?';

    // Execute the query using the provided IntegratorID
    connection.query(query, [IntegratorID], (err, results) => {
        if (err) {
            // Log and respond to SQL query errors
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error');
        }
        // Send the count of plants back to the client in a JSON format

        res.json({ PlantCount: results[0].PlantCount });
    });
});
// Export the router to be mounted by the main application
module.exports = router;
// End of code block


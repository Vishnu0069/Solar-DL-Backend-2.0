// Start of code block

// Import necessary modules
// Express for routing and custom database connection module for querying the database
// Written by Vishnu Prasad S
// Written on Date 26-04-2024
const express = require('express');
const router = express.Router();
const connection = require('../db/database');

// Define a POST endpoint to count the number of plants associated with a specific integrator
// This route handles POST requests that expect integratorid in the request body to fetch the count of plants
// Written by Vishnu Prasad S
// Written on Date 26-04-2024
router.post('/PlantCount', (req, res) =>
// Extract userData from the request body, which should contain the integratorid
{
    const { userData, fromDate, toDate } = req.body;
    const { integratorid } = userData;
    // Validate that the integrator ID is provided in the request
    if (!integratorid) {
        // Send a 400 Bad Request response if integrator ID is not provided
        res.status(400).send('Integrator ID is required');
        return;// Exit the function to prevent further processing
    }

    // SQL query to count the number of PlantID entries for a given IntegratorID
    const query = 'SELECT COUNT(PlantID) AS PlantCount FROM PlantMaster WHERE IntegratorID = ?';

    // Execute the query with the provided integrator ID
    connection.query(query, [integratorid], (err, results) => {
        if (err) {
            // Log and handle database query errors
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error');// Send a 500 Internal Server Error response

        }
        // Send the count of plants as JSON if the query is successful
        res.json({ PlantCount: results[0].PlantCount });
    });
});
// Export the router module for use in other parts of the application
module.exports = router;
// End of code block

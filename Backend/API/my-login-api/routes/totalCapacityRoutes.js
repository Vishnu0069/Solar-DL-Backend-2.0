// Start of code block

// Import required modules and setup the Express router
// Express for routing and a custom module for database connectivity
// Written by Vishnu Prasad S
// Written on Date 29-04-2024
const express = require('express');
const router = express.Router();
const connection = require('../db/database'); // Make sure this path is correct

// Define a POST route to calculate the total capacity of all plants associated with a specific IntegratorID
// This route expects a POST request with IntegratorID in the request body
// Written by Vishnu Prasad S
// Written on Date 29-04-2024
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
        // Retrieve the total capacity from the query result
        // Ensures that the result exists and defaults to 0 if null
        const totalCapacity = results[0].TotalCapacity || 0;
        // Send the total capacity back to the client in a JSON format
        res.json({ TotalCapacity: totalCapacity });
    });
});
// Export the router to be mounted by the main application

module.exports = router;
// End of code block


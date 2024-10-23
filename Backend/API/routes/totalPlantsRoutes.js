// Start of code block

// Import necessary modules and setup the Express router
// Express for routing, and a custom module for database connectivity
// Written by Vishnu Prasad S
// Written on Date 30-04-2024
/*const express = require('express');
const router = express.Router();
const connection = require('../db/database');

// Define a POST route to get the count of plants for a specific IntegratorID
// This route expects a POST request with IntegratorID in the request body
// Written by Vishnu Prasad S
// Written on Date 30-04-2024
router.post('/total-plant', (req, res) => {
    const { userData } = req.body;
    const { integratorid } = userData;


    // SQL query to count the number of plants associated with the specified IntegratorID
    const query = 'SELECT COUNT(PlantID) AS PlantCount FROM PlantMaster WHERE IntegratorID = ?';

    // Execute the query using the provided IntegratorID
    connection.query(query, [integratorid], (err, results) => {
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
// End of code block*/
const express = require('express');
const router = express.Router();
const connection = require('../config/database'); // Ensure this is the correct path to your database connection module

// Define a POST route to get both the count of plants and their total capacity for a specific IntegratorID
// This route expects a POST request with IntegratorID in the request body
// Written by Vishnu Prasad S
// Written on Date 03-05-2024
router.post('/totalCapacity1', (req, res) => {
    const { userData } = req.body;
    const { integratorid } = userData;

    if (!integratorid) {
        return res.status(400).send('Integrator ID is required');
    }

    // SQL query to count the number of plants and sum their capacities associated with the specified IntegratorID
    const plantCountQuery = 'SELECT COUNT(PlantID) AS PlantCount FROM PlantMaster WHERE IntegratorID = ?';
    const totalCapacityQuery = 'SELECT SUM(Capacity) AS TotalCapacity FROM PlantMaster WHERE IntegratorID = ?';

    // Execute the query to get the plant count
    connection.query(plantCountQuery, [integratorid], (err, countResults) => {
        if (err) {
            console.error('Database query error for plant count:', err);
            return res.status(500).send('Internal server error while fetching plant count');
        }

        // Execute the query to get the total capacity
        connection.query(totalCapacityQuery, [integratorid], (err, capacityResults) => {
            if (err) {
                console.error('Database query error for total capacity:', err);
                return res.status(500).send('Internal server error while fetching total capacity');
            }

            // Extract results and handle possible null values
            const plantCount = countResults[0].PlantCount || 0;
            const totalCapacity = capacityResults[0].TotalCapacity || 0;

            // Send both the count of plants and total capacity back to the client in a JSON format
            res.json({
                TotalInstallations: plantCount,
                TotalCapacity: totalCapacity
            });
        });
    });
});

module.exports = router;



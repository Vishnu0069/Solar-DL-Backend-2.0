/*const express = require('express');
const router = express.Router();
const connection = require('../db/database');

// Route to get plant count for a specific IntegratorID
router.post('/newinstallations', (req, res) => {
    const { userData, fromDate, toDate } = req.body;
    const { integratorid } = userData;

    // Function to ensure that the dateTime strings are valid and to adjust them if necessary
    function getAdjustedDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date string');
        }
        return date.toISOString();
    }

    try {
        const from_date_utc = getAdjustedDateTime(fromDate);
        const to_date_utc = getAdjustedDateTime(toDate);

        const query = `
            SELECT COUNT(*) AS InstallationCount
            FROM PlantMaster
            WHERE integratorid = ? AND install_date_time BETWEEN ? AND ?;
        `;

        connection.query(query, [integratorid, from_date_utc, to_date_utc], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                res.status(500).send('Internal server error');
                return;
            }
            res.json({ InstallationCount: results[0].InstallationCount });
            console.log(res.json)
        });
    } catch (error) {
        console.error('Date conversion error:', error.message);
        res.status(400).send('Invalid date format in request body');
    }
});

module.exports = router;*/

// Start of code block

// Import necessary modules and packages
// Express for routing, MongoDB client for database interaction, and dotenv for environment variables
// Written by Vishnu Prasad S
// Written on Date 25-04-2024
const express = require('express');
const router = express.Router();
const connection = require('../db/database');

// Route to get plant count for a specific IntegratorID
// This route handles POST requests and expects 'integratorid', 'fromDate', and 'toDate' in the request body
// Written by Vishnu Prasad S
// Written on Date 25-04-2024
router.post('/newinstallations', (req, res) => {
    const { userData, fromDate, toDate } = req.body;
    const { integratorid } = userData;

    // Function to ensure that the dateTime strings are valid and to adjust them if necessary
    // Converts the input string to a date object and checks for validity
    function getAdjustedDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date string');
        }
        return date.toISOString();
    }

    try {
        const from_date_utc = getAdjustedDateTime(fromDate);
        const to_date_utc = getAdjustedDateTime(toDate);
        // SQL query to count the number of installations for a given integrator within the specified date range
        const query = `
            SELECT COUNT(*) AS InstallationCount
            FROM PlantMaster
            WHERE integratorid = ? AND install_date_time BETWEEN ? AND ?;
        `;
        // Execute the query using the provided integrator ID and date range
        connection.query(query, [integratorid, from_date_utc, to_date_utc], (err, results) => {
            if (err) {
                // Log and send a server error response if the query fails
                console.error('Database query error:', err);
                res.status(500).send('Internal server error');
                return;
            }
            // Construct the response object to send back to the client
            const response = {
                title: "New Installations", // Example title
                value: results[0].InstallationCount,
                date: toDate // Use the 'toDate' provided in the request
            };
            res.json(response); // Send the response back to the client
        });
    } catch (error) {
        // Catch and handle any errors related to date conversion
        console.error('Date conversion error:', error.message);
        res.status(400).send('Invalid date format in request body');
    }
});
// Export the router module for use in other parts of the application
module.exports = router;

// End of code block

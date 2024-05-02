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
const express = require('express');
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
            // Construct the response object to send back to the client
            const response = {
                title: "New Installations", // Example title
                value: results[0].InstallationCount,
                date: toDate // Use the 'toDate' provided in the request
            };
            res.json(response); // Send the response back to the client
        });
    } catch (error) {
        console.error('Date conversion error:', error.message);
        res.status(400).send('Invalid date format in request body');
    }
});

module.exports = router;


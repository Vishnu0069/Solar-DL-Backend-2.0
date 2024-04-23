const express = require('express');
const router = express.Router();
const connection = require('../db/database');
const moment = require('moment'); // Import moment.js for date manipulations

router.post('/GetNewInstallations', (req, res) => {
    console.log("Endpoint Hit: /GetNewInstallations");
    const { IntegratorID, FromDate, ToDate } = req.body;

    // Convert local datetime to UTC and correct format
    const fromDateUTC = moment(FromDate).utc().format('YYYY-MM-DD mm:ss');
    const toDateUTC = moment(ToDate).utc().format('YYYY-MM-DD mm:ss');

    const query = `
        SELECT COUNT(*) AS InstallationCount
        FROM PlantMaster
        WHERE IntegratorID = ?
          AND creation_date BETWEEN ? AND ?`;

    connection.query(query, [IntegratorID, fromDateUTC, toDateUTC], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error');
        }
        res.send({ NewInstallations: results[0].InstallationCount });
    });
});

module.exports = router;

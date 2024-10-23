/*// Start of code block

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
// End of code block*/

/*const express = require('express');
const router = express.Router();
const connection = require('../db/database');  // SQL database connection
const { MongoClient } = require('mongodb');    // MongoDB client

// MongoDB connection setup
const mongoUri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUri);

async function getPlantIdsFromList(integratorId) {
    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGODB_DB_NAME);
    const listCollection = db.collection(process.env.MONGODB_LIST_NAME);
    const plants = await listCollection.find({ "metadata.integratorId": integratorId }).project({ PlantID: 1 }).toArray();
    await mongoClient.close();
    return plants.map(p => p.PlantID);
}

async function checkPlantOnlineStatus(plantIds) {
    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGODB_DB_NAME);
    const tempPlantDataCollection = db.collection(process.env.MONGODB_TEMP_PLANT_NAME);
    const onlinePlants = await tempPlantDataCollection.find({ Plantid: { $in: plantIds } }).toArray();
    await mongoClient.close();
    return onlinePlants.map(p => p.Plantid);
}

router.post('/PlantCount', async (req, res) => {
    const { userData } = req.body;
    const { integratorid } = userData;

    if (!integratorid) {
        res.status(400).send('Integrator ID is required');
        return;
    }

    try {
        const plantIds = await getPlantIdsFromList(integratorid);
        const onlinePlantIds = await checkPlantOnlineStatus(plantIds);
        const onlineCount = onlinePlantIds.length;
        const offlineCount = plantIds.length - onlineCount;

        // Retrieve the total plant count from SQL
        const query = 'SELECT COUNT(PlantID) AS PlantCount FROM PlantMaster WHERE IntegratorID = ?';
        connection.query(query, [integratorid], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Internal server error');
            }
            res.json({ PlantCount: results[0].PlantCount, Online: onlineCount, Offline: offlineCount });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Failed to process request');
    }
});

module.exports = router;
*/
const express = require('express');
const router = express.Router();
const connection = require('../config/database');  // SQL database connection
const { MongoClient } = require('mongodb');    // MongoDB client

// MongoDB connection setup
const mongoUri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;
async function connectMongo() {
    try {
        await mongoClient.connect();
        console.log("Connected to MongoDB");
        db = mongoClient.db(process.env.MONGODB_DB_NAME);
        // Optional: Use this approach if you want to handle disconnects:
        mongoClient.on('close', () => {
            console.log('MongoDB connection was closed');
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}

async function getPlantIdsFromList(integratorId) {
    const listCollection = db.collection(process.env.MONGODB_LIST_NAME);
    const plants = await listCollection.find({ "metadata.integratorId": integratorId }).project({ PlantID: 1 }).toArray();
    return plants.map(p => p.PlantID);
}

async function checkPlantOnlineStatus(plantIds) {
    const tempPlantDataCollection = db.collection(process.env.MONGODB_TEMP_PLANT_NAME);
    const onlinePlants = await tempPlantDataCollection.find({ Plantid: { $in: plantIds } }).toArray();
    return onlinePlants.map(p => p.Plantid);
}

router.post('/online-offline', async (req, res) => {
    const { userData } = req.body;
    const { integratorid } = userData;

    if (!integratorid) {
        res.status(400).send('Integrator ID is required');
        return;
    }

    try {
        const plantIds = await getPlantIdsFromList(integratorid);
        const onlinePlantIds = await checkPlantOnlineStatus(plantIds);
        const onlineCount = onlinePlantIds.length;
        const offlineCount = plantIds.length - onlineCount;

        // Retrieve the total plant count from SQL
        const query = 'SELECT COUNT(PlantID) AS PlantCount FROM PlantMaster WHERE IntegratorID = ?';
        connection.query(query, [integratorid], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).send('Internal server error');
            }
            res.json({ PlantCount: results[0].PlantCount, Online: onlineCount, Offline: offlineCount });
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Failed to process request');
    }
});

// Connect to MongoDB when server starts
connectMongo();

module.exports = router;

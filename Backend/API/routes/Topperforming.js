
/*const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json()); // Middleware to parse JSON

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = process.env.MONGODB_DB_NAME;
const collectionName = process.env.MONGODB_TOP_PERFORMING_NAME; // Adjust the collection name as needed

// Route to get all plants for a specific IntegratorID
app.post('/top-plants', async (req, res) => {
    const { userData } = req.body;
    const { integratorid } = userData;

    if (!integratorid) {
        res.status(400).send('Integrator ID is required');
        return;
    }

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Updated query to match the document structure
        const query = { integratorId: integratorid };
        const plants = await collection.find(query).toArray();

        res.status(200).json(plants);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).send('Internal server error');
    } finally {
        await client.close();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Exports the app for testing or further modularization
*/

// Start of code block

// Import necessary modules
// Express for routing, MongoClient for database interactions, and dotenv for environment variables
// Written by Vishnu Prasad S
// Written on Date 28-04-2024
const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();
require('dotenv').config();

const app = express();
app.use(express.json());

// Retrieve MongoDB URI from environment variables and create a MongoDB client
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define database and collection names from environment variables
const dbName = process.env.MONGODB_DB_NAME;
const collectionName = process.env.MONGODB_TOP_PERFORMING_NAME;

// Route to get top performing plants based on Performance Ratio (PR%) within a date range for a specific IntegratorID
// This endpoint handles POST requests and expects integratorid, fromDate, and toDate in the request body
// Written by Vishnu Prasad S
// Written on Date 28-04-2024
router.post('/top-plants', async (req, res) => {
    const { userData, fromDate, toDate } = req.body;
    const { integratorid } = userData;

    if (!integratorid) {
        res.status(400).send('Integrator ID is required');
        return;
    }

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const query = {
            integratorId: integratorid,
            date: {
                $gte: fromDate,
                $lte: toDate
            }
        };

                // Define the aggregation pipeline for calculating average PR%
        const aggregation = [
            { $match: query },
            { $group: {
                _id: "$plantId",
                avgPR: { $avg: "$prPercent" }, // Calculate the average PR%
                details: { $first: "$$ROOT" } // Grab the first document to use its details
            }},
            { $sort: { avgPR: -1 } }, // Sort by average PR% in descending order
            { $project: {// Define the fields to return
                _id: 0,
                plantId: "$_id",
                avgPR: 1,
                plantName: "$details.plantName",
                district: "$details.district",
                plantType: "$details.plantType",
                gridStatus:"$details.gridStatus",
                region: "$details.region",
                state: "$details.state",
                systemType: "$details.systemType"

            }}
        ];

                // Execute the aggregation pipeline
        const plants = await collection.aggregate(aggregation).toArray();

                // Send the results as a JSON response
        res.status(200).json(plants);
    } catch (error) {
                // Log and handle database query errors
        console.error('Database query error:', error);
        res.status(500).send('Internal server error');
    } finally {
                // Ensure the MongoDB client is closed after the query
        await client.close();
    }
});

// Export the router module for use in other parts of the application
module.exports = router;
// End of code block

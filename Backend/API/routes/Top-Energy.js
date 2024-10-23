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

const dbName = process.env.MONGODB_DB_NAME;
const collectionName = process.env.MONGODB_PLANT_ENERGY_NAME;

// Route to get top performing plants within a date range for a specific IntegratorID
// This endpoint handles POST requests and expects integratorid, fromDate, and toDate in the request body
// Written by Vishnu Prasad S
// Written on Date 28-04-2024
router.post('/top-energy', async (req, res) => {
        // Extract userData and date range from the request body
    const { userData, fromDate, toDate } = req.body;
    const { integratorid } = userData;
    // Validate that the integrator ID is provided in the request
    if (!integratorid) {
        res.status(400).send('Integrator ID is required');
        return;// Exit the function to prevent further processing
    }

    try {
        // Connect to the MongoDB database
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        
                // Define the query object for MongoDB aggregation
        const query = {
            integratorId: integratorid,
            date: {
                $gte: fromDate,
                $lte: toDate
            }
        };

                // Define the aggregation pipeline for calculating average energy
        const aggregation = [
            { $match: query },
            { $group: {
                _id: "$plantId",
                Energy: { $sum: "$Energy" },// Calculate the average energy
                details: { $first: "$$ROOT" } // Capture the first document of each group for plant details
            }},
           
            { $sort: { Energy: -1 } },// Sort by average energy in descending order
            { $project: {// Define the fields to return
                _id: 0,
                plantId: "$_id",
                Energy: 1,
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


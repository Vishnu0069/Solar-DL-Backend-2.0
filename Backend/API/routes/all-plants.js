// Import necessary modules
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
const dailyEnergyCollectionName = process.env.MONGODB_PLANT_DAILY_ENERGY;

// Route to get all documents from the MONGODB_PLANT_DAILY_ENERGY collection
router.get('/all-plants', async (req, res) => {
    try {
        // Connect to the MongoDB database
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(dailyEnergyCollectionName);

        // Define the aggregation pipeline for customizing the output
        const aggregation = [
            {
                $project: {
                    _id: 0, // Exclude the MongoDB default _id field
                    Plantid: 1,
                    Date: 1,
                    TotalEnergyOutput: 1,
                    LatestEnergyOutput: 1,
                    EnergyUnits: 1,
                    plantName: "$Header.PlantName",
                    district: "$Header.District",
                    plantType: "$Header.PlantType",
                    gridStatus: "$Header.GridStatus",
                    region: "$Header.Region",
                    state: "$Header.State",
                    Capacity:"$Header.PlantCapacity",
                    systemType: "$Header.PlantSystemType"
                }
            }
        ];

        // Execute the aggregation pipeline
        const results = await collection.aggregate(aggregation).toArray();

        // Send the results as a JSON response
        res.status(200).json(results);
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

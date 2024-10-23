// Start of code block

// Import necessary modules and packages
// Express for routing, MongoDB client for database interaction, and dotenv for environment variables
// Written by Vishnu Prasad S
// Written on Date 25-04-2024
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Initialize the router object from Express to define route endpoints
const router = express.Router();
router.use(express.json());// Middleware to parse JSON bodies

// Setup the MongoDB client using environment variables
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Retrieve the database name and the collection name from environment variables
const dbName = process.env.MONGODB_DB_NAME;
const tempPlantDataCollection = process.env.MONGODB_TEMP_PLANT_NAME;

// Define a POST endpoint to get estimated vs actual energy for each plant under an integrator
// This endpoint handles requests to calculate and return energy production data for plants managed by an integrator
// Written by Vishnu Prasad S
// Written on Date 25-04-2024
router.post('/estimated-vs-actual', async (req, res) => {
    const { userData } = req.body;
    const { integratorid } = userData;

    if (!integratorid) {// Validate that the integrator ID is provided in the request body
        return res.status(400).send({ error: 'Integrator ID is required' });
    }

    try {
        await client.connect();
        const database = client.db(dbName);
        const tempPlantCollection = database.collection(tempPlantDataCollection);

        // Fetch all plants under the specified integrator ID from the temp plant data collection
        const plants = await tempPlantCollection.find({ "Header.integratorId": integratorid }).toArray();

        // Map through each plant to fetch its latest energy data entry
        const results = await Promise.all(plants.map(async (plant) => {
            const plantId = plant.Plantid;
            // Fetch the latest entry for each plant sorted by the LocalDateTime field
            const latestEntry = await tempPlantCollection.find({ Plantid: plantId }).sort({ "Plantdata.LocalDateTime": -1 }).limit(1).toArray();

            // Calculate the estimated and actual energy based on the latest data entry
            const estimated = plant.Header.PlantCapacity;
            const actual = latestEntry.length > 0 && latestEntry[0].Plantdata.length > 0
                ? (latestEntry[0].Plantdata[latestEntry[0].Plantdata.length - 1].OutputEnergy / 900) : 0;

            // Return structured data for each plant including estimated and actual energy values
            return {
                plantId: plantId,
                plantName: plant.Header.PlantName,
                district: plant.Header.District,
                plantType: plant.Header.PlantType,
                region: plant.Header.Region,
                state: plant.Header.State,
                systemType: plant.Header.PlantSystemType,
                estimated: estimated,
                actual: actual.toFixed(2) // Adjust the output for consistency
            };
        }));

        // Send the results as a JSON response
        res.status(200).json(results);
    } catch (error) {
        // Log and handle any errors during database queries
        console.error('Database query error:', error);
        res.status(500).send('Internal server error');
    } finally {
        // Ensure the MongoDB client is closed after the operation is complete

        await client.close();
    }
});


// Export the router module for use in other parts of the application
module.exports = router;

// End of code block

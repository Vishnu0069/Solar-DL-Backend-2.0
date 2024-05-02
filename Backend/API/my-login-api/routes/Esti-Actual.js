const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const router = express.Router();
router.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = process.env.MONGODB_DB_NAME;
const tempPlantDataCollection = process.env.MONGODB_TEMP_PLANT_NAME;

// Endpoint to get estimated vs actual energy for each plant under an integrator
router.post('/estimated-vs-actual', async (req, res) => {
    const { userData } = req.body;
    const { integratorid } = userData;

    if (!integratorid) {
        return res.status(400).send({ error: 'Integrator ID is required' });
    }

    try {
        await client.connect();
        const database = client.db(dbName);
        const tempPlantCollection = database.collection(tempPlantDataCollection);

        // Fetch all plants under the specified integrator ID, directly using the temp plant data
        const plants = await tempPlantCollection.find({ "Header.integratorId": integratorid }).toArray();

        const results = await Promise.all(plants.map(async (plant) => {
            const plantId = plant.Plantid;
            // Fetch the latest entry for each plant
            const latestEntry = await tempPlantCollection.find({ Plantid: plantId }).sort({ "Plantdata.LocalDateTime": -1 }).limit(1).toArray();

            const estimated = plant.Header.PlantCapacity;
            const actual = latestEntry.length > 0 && latestEntry[0].Plantdata.length > 0 
                ? (latestEntry[0].Plantdata[latestEntry[0].Plantdata.length - 1].OutputEnergy / 900) : 0;

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

        res.status(200).json(results);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500). send('Internal server error');
    } finally {
        await client.close();
    }
});


module.exports = router;

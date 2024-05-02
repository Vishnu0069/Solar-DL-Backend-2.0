
const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();
require('dotenv').config();

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = process.env.MONGODB_DB_NAME;
const collectionName = process.env.MONGODB_PLANT_ENERGY_NAME;

// Route to get top performing plants within a date range for a specific IntegratorID
router.post('/top-energy', async (req, res) => {
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

        const aggregation = [
            { $match: query },
            { $group: {
                _id: "$plantId",
                avgEnergy: { $avg: "$Energy" },
                details: { $first: "$$ROOT" } // Grab the first document to use its details
            }},
            { $sort: { avgEnergy: -1 } },
            { $project: {
                _id: 0,
                plantId: "$_id",
                avgEnergy: 1,
                plantName: "$details.plantName",
                district: "$details.district",
                plantType: "$details.plantType",
                region: "$details.region",
                state: "$details.state",
                systemType: "$details.systemType"
            }}
        ];

        const plants = await collection.aggregate(aggregation).toArray();

        

        res.status(200).json(plants);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).send('Internal server error');
    } finally {
        await client.close();
    }
});


module.exports = router;



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
const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();
require('dotenv').config();

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = process.env.MONGODB_DB_NAME;
const collectionName = process.env.MONGODB_TOP_PERFORMING_NAME;

// Route to get top performing plants within a date range for a specific IntegratorID
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

        const aggregation = [
            { $match: query },
            { $group: {
                _id: "$plantId",
                avgPR: { $avg: "$prPercent" },
                details: { $first: "$$ROOT" } // Grab the first document to use its details
            }},
            { $sort: { avgPR: -1 } },
            { $project: {
                _id: 0,
                plantId: "$_id",
                avgPR: 1,
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


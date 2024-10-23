require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = process.env.MONGODB_DB_NAME;
const plantDataCollectionName = process.env.MONGODB_TEMP_PLANT_COLLECTION_NAME;
const plantEnergyCollectionName = process.env.MONGODB_PLANT_ENERGY_COLLECTION_NAME;

async function main() {
    try {
        console.log("Starting application...");
        await client.connect();
        console.log("Connected to MongoDB server.");
        const db = client.db(dbName);

        const currentUtcDate = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
        const istDate = new Date(currentUtcDate.getTime() + istOffset);
        const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

        console.log(`Using local datetime for matching: ${currentLocalDateTime}`);
        await calculateAndStorePlantTotalEnergy(db, currentLocalDateTime);

        logToFile("M7(S3)", "L2", "S3 Service", "success", "Operations completed successfully.");
    } catch (err) {
        console.error('An error occurred:', err);
        logToFile("M7(S3)", "L2", "S3 Service", "error", err.message);
    } finally {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

async function calculateAndStorePlantTotalEnergy(db, currentLocalDateTime) {
    const plantDataCollection = db.collection(plantDataCollectionName);
    const plantEnergyCollection = db.collection(plantEnergyCollectionName);

    // Split the date from the local datetime to filter records from the same day
    const currentDate = currentLocalDateTime.split(' ')[0];

    const pipeline = [
        { $match: { "Plantdata.LocalDateTime": { $regex: `^${currentDate}` } } }, // Filter to current day
        { $unwind: "$Plantdata" },
        { $sort: { "Plantdata.LocalDateTime": -1 } }, // Sort to ensure latest entries are processed first
        { $group: {
            _id: "$Plantid",
            TotalEnergy: { $sum: "$Plantdata.OutputEnergy" }, // Sum of all output energy for the day
            LatestOutputEnergy: { $first: "$Plantdata.OutputEnergy" }, // Capture the latest output energy
            LatestDateTime: { $first: "$Plantdata.LocalDateTime" }, // Capture the datetime of the latest output
            Header: { $first: "$Header" } // Maintain the first encountered Header for completeness
        }},
        { $project: {
            _id: 0, // Let MongoDB handle _id creation
            Plantid: "$_id",
            Date: "$LatestDateTime", // Use the datetime from the latest entry
            TotalEnergyOutput: "$TotalEnergy",
            LatestEnergyOutput: "$LatestOutputEnergy",
            EnergyUnits: "KWH",
            Header: "$Header"
        }}
    ];

    const results = await plantDataCollection.aggregate(pipeline).toArray();

    for (const result of results) {
        await plantEnergyCollection.insertOne(result);
        logToFile("M7(S3)", "L2", "S3 Service", "success", `Processed total energy for plant ${result.Plantid} with latest output at ${result.Date}`);
    }

    logToFile("M7(S3)", "L2", "S3 Service", "complete", 'calculateAndStorePlantTotalEnergy finished');
}



function logToFile(serviceName, operationType, status, message) {
    const now = new Date();
    const timestamp = now.toISOString();
    const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

    fs.appendFile('M5.log', logMessage, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });
}

main();

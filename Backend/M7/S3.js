// Start of code block

// Import necessary modules for environment configurations, MongoDB operations, and asynchronous file operations
// Sets up MongoDB client for database interactions and configures environment variables
// Written by Vishnu Prasad S
// Written at date: 23-04-2024
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
// Define MongoDB connection URI and client with proper configuration for useUnifiedTopology and useNewUrlParser
// MongoClient is used to connect to the MongoDB database where all operations are performed
// Written by Vishnu Prasad S
// Written at date: 23-04-2024
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Database and collection names are retrieved from environment variables for modularity and security
// These collections are used throughout the script for various data operations
// Written by Vishnu Prasad S
// Written at date: 23-04-2024
const dbName = process.env.MONGODB_DB_NAME;
const plantDataCollectionName = process.env.MONGODB_TEMP_PLANT_COLLECTION_NAME;
const plantEnergyCollectionName = process.env.MONGODB_PLANT_ENERGY_COLLECTION_NAME;
const deviceDataCollectionName = process.env.MONGODB_DEVICE_DATA_COLLECTION_NAME;
const deviceEnergyCollectionName = process.env.MONGODB_DEVICE_ENERGY_COLLECTION_NAME;

// Function to log messages to a file with timestamp, enhancing traceability and error handling
// Logs include service name, operation type, status, and detailed messages for auditing purposes
// Written by Vishnu Prasad S
// Written at date: 23-04-2024
async function logToFile(serviceName,logLevel, operationType, status, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
    try {
        await fs.appendFile('M7.log', logMessage);
    } catch (err) {
        console.error('Error writing to log file:', err);
    }
}

// Main function to execute database operations and calculations for plant and device energy
// Connects to the database, processes data, and handles errors and final connection closure
// Written by Vishnu Prasad S
// Written at date: 23-04-2024
async function main() {
    try {
        console.log("M7(S3)", "L1","S3 Service", "success","Started Successfully..");
        await client.connect();
        console.log("M7(S3)", "L2","S3 Service", "success","Connected correctly to server");
        const db = client.db(dbName);
        // Calculate the current LocalDateTime in IST (UTC+5:30) to be used in subsequent operations

        const currentUtcDate = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
        const istDate = new Date(currentUtcDate.getTime() + istOffset);
        const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');
        const specifiedDate = currentLocalDateTime;
        // Perform energy calculations for both plant and device data
        await calculateAndStorePlantTotalEnergy(db, currentLocalDateTime);
        await calculateAndStoreDeviceTotalEnergy(db, currentLocalDateTime);

        logToFile("M7(S3)", "L2","S3 Service", "success","Operations completed successfully.");
    } catch (err) {
        //console.error('An error occurred:', err);
        await logToFile("M7(S3)", "L2","S3 Service", "Error", err.message);
    } finally {
        await client.close();
    }
}

/*async function calculateAndStorePlantTotalEnergy(db, specifiedDate) {
    const plantDataCollection = db.collection(plantDataCollectionName);
    const plantEnergyCollection = db.collection(plantEnergyCollectionName);

    const pipeline = [
        { $match: { "Localdatetime": { $regex: `^${specifiedDate}` } } },
        { $group: {
            _id: "$Plantid",
            TotalEnergy: { $sum: "$Energyoutput" },
            Header: { $first: "$Header" }  // Capture header from the first document of each group
        }},
        { $project: {
            Plantid: "$_id",
            Date: specifiedDate,
            EnergyOutput: "$TotalEnergy",
            EnergyUnits: "KWH",
            Header: "$Header"
        }}
    ];

    const results = await plantDataCollection.aggregate(pipeline).toArray();
    for (const result of results) {
        await plantEnergyCollection.updateOne(
            { Plantid: result.Plantid, Date: result.Date },
            { $set: result },
            { upsert: true }
        );
        await logToFile('PlantEnergyCollection', 'UpdateInsert', 'Success', `Processed total energy for plant ${result.Plantid}`);
    }
}
*/

async function calculateAndStorePlantTotalEnergy(db, specifiedDate) {
    logToFile("M7(S3)", "L2","S3 Service", "success",'calculateAndStorePlantTotalEnergy started'); // Log start
    // Retrieve the MongoDB collections for plant data and energy
    // These collections are utilized to fetch raw plant data and store aggregated energy results
    // Written by Vishnu Prasad S
    // Written at date: 23-04-2024
    const plantDataCollection = db.collection(plantDataCollectionName);
    const plantEnergyCollection = db.collection(plantEnergyCollectionName);

    // Extract only the date part (YYYY-MM-DD) for matching documents by date, ensuring data is aggregated daily
    // This simplifies the matching process in the MongoDB query
    // Written by Vishnu Prasad S
    // Written at date: 23-04-2024
    const dateOnly = specifiedDate.slice(0, 10);

    // Define the MongoDB aggregation pipeline for processing plant energy data
    // The pipeline matches documents by date, unwinds the data, groups by plant ID, and computes total energy and performance ratio (PR)
    // Written by Vishnu Prasad S
    // Written at date: 23-04-2024    
    const pipeline = [
        {
            $match: {
                // Match entries by date, using a regex pattern to include all entries from the specified date
                "Plantdata.LocalDateTime": { $regex: `^${dateOnly}` }
            }
        },
        {
            $unwind: "$Plantdata" // Unwind the array to perform operations on each element individually
        },
        {
            $group: {
                _id: "$Plantid", // Group data by plant ID
                TotalEnergy: { $sum: "$Plantdata.OutputEnergy" }, // Sum the OutputEnergy values
                Header: { $first: "$Header" }, // Use the first Header document of each group
                Capacity: { $first: "$Header.PlantCapacity" } // Correctly accessing PlantCapacity from Header
            }
        },
        {
            $project: {
                Plantid: "$_id",
                Date: { $concat: [dateOnly, " 00-00"] }, // Use the date without the time for the final document
                EnergyOutput: "$TotalEnergy",
                EnergyUnits: "KWH",
                Header: "$Header",
                PRPercent: {
                    $cond: {
                        if: { $eq: ["$Capacity", 0] }, // Check to prevent division by zero
                        then: 0,
                        else: {
                            $multiply: [
                                {
                                    $divide: [
                                        "$TotalEnergy",
                                        { $multiply: ["$Capacity", 1000, 5.5] } // Convert capacity from MW to KWH if necessary
                                    ]
                                },
                                100
                            ]
                        }
                    }
                }

            }
        }
    ];

    // Execute the aggregation pipeline and process the results
    // Each result is upserted into the plant energy collection, ensuring data is current and accurate
    // Written by Vishnu Prasad S
    // Written at date: 23-04-2024
    const results = await plantDataCollection.aggregate(pipeline).toArray();

    for (const result of results) {
        // Upsert the summarized daily energy data into the plantEnergyCollection
        // Upserts ensure that existing entries are updated or new entries are created if they do not exist
        await plantEnergyCollection.updateOne(
            { Plantid: result.Plantid, Date: result.Date },
            { $set: result },
            { upsert: true }
        );
        // Log the successful update or insertion of plant energy data

        await logToFile("M7(S3)", "L2","S3 Service", "success", `Processed total energy and PR for plant ${result.Plantid}`);
    }
    logToFile("M7(S3)", "L2","S3 Service", "success",'calculateAndStorePlantTotalEnergy finished'); // Log finish
}


/*async function calculateAndStoreDeviceTotalEnergy(db, specifiedDate) {
  const deviceDataCollection = db.collection(deviceDataCollectionName);
  const deviceEnergyCollection = db.collection(deviceEnergyCollectionName);

  // Format the specified date to only include the date part (YYYY-MM-DD)
  const dateOnly = specifiedDate.slice(0, 10) + " 00-00";  // Adjusting time to 00-00 for daily aggregation

  const pipeline = [
      { $match: { "Localdatetime": { $regex: `^${specifiedDate}` } } },
      { $group: {
          _id: "$Deviceuid",
          TotalEnergy: { $sum: "$Energyoutput" },
          Header: { $first: "$Header" }  // Capture header from the first document of each group
      }},
      { $project: {
          _id: 0,
          DeviceID: "$_id",
          Date: dateOnly,  // Use the date with time reset to 00-00
          EnergyOutput: "$TotalEnergy",
          EnergyUnits: "KWH",
          Header: "$Header"
      }}
  ];

  const results = await deviceDataCollection.aggregate(pipeline).toArray();

  for (const result of results) {
      // Upsert the summarized daily energy data into the deviceEnergyCollection
      await deviceEnergyCollection.updateOne(
          { DeviceID: result.DeviceID, Date: result.Date },
          { $set: result },
          { upsert: true }
      );
      await logToFile('DeviceEnergyCollection', 'UpdateInsert', 'Success', `Processed total energy for device ${result.DeviceID} on ${result.Date}`);
  }
}*/ //this works kinda fine...

// Function to calculate and store the total energy consumption for each device on a specified date
// Aggregates energy output data from device data collection and stores summarized results in device energy collection
// Written by Vishnu Prasad S
// Written at date: 23-04-2024
async function calculateAndStoreDeviceTotalEnergy(db, specifiedDate)
// Retrieve device data and device energy collections from the MongoDB database
// These collections are used to read raw data and store aggregated energy results
// Written by Vishnu Prasad S
// Written at date: 23-04-2024
{
    const deviceDataCollection = db.collection(deviceDataCollectionName);
    const deviceEnergyCollection = db.collection(deviceEnergyCollectionName);

    // Extract only the date part (YYYY-MM-DD) for matching documents by date, ensuring data is aggregated daily
    // This ensures that the energy data is summarized by each day without including time variations
    // Written by Vishnu Prasad S
    // Written at date: 23-04-2024
    const dateOnly = specifiedDate.slice(0, 10);
    // Define the aggregation pipeline for processing device energy data
    // Pipeline matches documents by date, groups by device ID to sum energy outputs, and formats the results for storage
    // Written by Vishnu Prasad S
    // Written at date: 23-04-2024
    const pipeline = [
        {
            $match: {
                // Match entries only by date, assuming Localdatetime is stored as 'YYYY-MM-DD HH-MM'
                "Localdatetime": { $regex: `^${dateOnly}` }
            }
        },
        {
            $group: {
                _id: "$Deviceuid",  // Group by device ID
                TotalEnergy: { $sum: "$Energyoutput" },  // Sum the energy outputs for the device
                Header: { $first: "$Header" }  // Capture header from the first document of each group
            }
        },
        {
            $project: {
                _id: 0,
                DeviceID: "$_id",
                Date: { $concat: [dateOnly, " 00-00"] },  // Format date with '00-00' for time
                EnergyOutput: "$TotalEnergy",
                EnergyUnits: "KWH",
                Header: "$Header"
            }
        }
    ];
    // Execute the aggregation pipeline and process the results
    // Each result is upserted into the device energy collection, ensuring data is current and accurate
    // Written by Vishnu Prasad S
    // Written at date: 23-04-2024
    const results = await deviceDataCollection.aggregate(pipeline).toArray();

    for (const result of results) {
        // Upsert the summarized daily energy data into the deviceEnergyCollection
        // Upserts ensure that existing entries are updated or new entries are created if they do not exist
        // Written by Vishnu Prasad S
        // Written at date: 23-04-2024
        await deviceEnergyCollection.updateOne(
            {
                DeviceID: result.DeviceID,
                Date: result.Date
            },
            { $set: result },
            { upsert: true }
        );
        // Log the successful update or insertion of device energy data
        // Logging provides traceability and helps in monitoring the operation's success
        // Written by Vishnu Prasad S
        // Written at date: 23-04-2024
        await logToFile("M7(S3)", "L2","S3 Service", "success", `Processed total energy for device ${result.DeviceID} on ${result.Date}`);
    }
}

// Execute the main function and handle any uncaught exceptions
// This execution block serves as the entry point for the script, ensuring that database operations are performed
// Written by Vishnu Prasad S
// Written at date: 23-04-2024

main().catch(console.error);
// End of code block

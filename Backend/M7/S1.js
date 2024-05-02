// Start of code block

// Import necessary modules for environment configurations, MongoDB operations, logging, and file operations
// Written by Vishnu Prasad S
// Written at date: 10-04-2024
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { log } = require('util');
const fs = require('fs').promises;

// Function to log messages to a file, including the timestamp and the message content
// Useful for tracking application behavior and diagnosing issues
// Written by Vishnu Prasad S
// Written at date: 10-04-2024
async function logToFile(serviceName, operationType, status, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
    try {
        await fs.appendFile('M7.log', logMessage);
    } catch (err) {
        console.error('Error writing to log file:', err);
    }
}

/*async function aggregateDeviceData(database) {
    const sourceCollection = database.collection(process.env.MONGODB_COLLECTION_NAME);
    const tempCollection = database.collection(process.env.MONGODB_TEMP_COLLECTION_NAME);

    // Aggregation pipeline
    const aggregationPipeline = [
        {
            $group: {
                _id: "$PlantID",
                DeviceUUIDs: { $push: "$DeviceUUID" }
            }
        }
    ];

    const results = await sourceCollection.aggregate(aggregationPipeline).toArray();
    for (let result of results) {
        const document = {
            LocalDateTime: new Date().toISOString().replace('T', ' ').substring(0, 16).replace(':', '-'),
            PlantId: result._id,
            DeviceId: result.DeviceUUIDs
        };
        await tempCollection.insertOne(document);
        await logToFile("MongoDB", "Insert", "Success", `Aggregated data inserted for PlantId: ${result._id}`);
    }
}*/
// ...
//stores localDt in Ist not in UTC

// Function to aggregate device data from a MongoDB database and log the operation
// Processes data to group by plant ID and collects device UUIDs for each plant
// Written by Vishnu Prasad S
// Written at date: 10-04-2024
async function aggregateDeviceData(database)
// Access the source and temporary collections from the MongoDB database
// These collections are used to read raw data and store aggregated results, respectively
// Written by Vishnu Prasad S
// Written at date: 10-04-2024
{
    const sourceCollection = database.collection(process.env.MONGODB_COLLECTION_NAME);
    const tempCollection = database.collection(process.env.MONGODB_TEMP_COLLECTION_NAME);

    // Define the aggregation pipeline to group data by PlantID and collect associated DeviceUUIDs
    // This operation groups all device identifiers under their respective plant identifiers
    // Written by Vishnu Prasad S
    // Written at date: 10-04-2024
    const aggregationPipeline = [
        {
            $group: {
                _id: "$PlantID",
                DeviceUUIDs: { $push: "$DeviceUUID" }
            }
        }
    ];

    // Calculate the current local date and time in IST (Indian Standard Time, UTC+5:30)
    // The LocalDateTime is used to timestamp the aggregated data entries uniquely
    // Written by Vishnu Prasad S
    // Written at date: 10-04-2024
    const currentUtcDate = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours and 30 minutes converted to milliseconds
    const istDate = new Date(currentUtcDate.getTime() + istOffset);
    const LocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

    // Execute the aggregation pipeline and process the results
    // Each result is checked against existing entries to avoid duplicates before insertion
    // Written by Vishnu Prasad S
    // Written at date: 10-04-2024
    const results = await sourceCollection.aggregate(aggregationPipeline).toArray();
    for (let result of results) {
        // Check if this aggregate already exists in tempCollection for the current LocalDateTime
        const existingAggregate = await tempCollection.findOne({
            PlantId: result._id,
            LocalDateTime: LocalDateTime
        });

        // Insert the new aggregated data if it does not already exist for the current LocalDateTime
        // Written by Vishnu Prasad S
        // Written at date: 10-04-2024
        if (!existingAggregate) {
            const document = {
                LocalDateTime: LocalDateTime,
                PlantId: result._id,
                DeviceId: result.DeviceUUIDs
            };
            await tempCollection.insertOne(document);
            await logToFile("MongoDB", "Insert", "Success", `Aggregated data inserted for PlantId: ${result._id}`);
        } else {
            await logToFile("MongoDB", "Insert", "Skipped", `Aggregated data already exists for PlantId: ${result._id} at LocalDateTime: ${LocalDateTime}`);
        }
    }
}

// ...


// ... [other parts of your script remain unchanged] ...

/*async function dfn_temp_devicedata(database) {
    const tempCollection = database.collection(process.env.MONGODB_TEMP_COLLECTION_NAME);
    const rawDataCollection = database.collection(process.env.MONGODB_RAW_DATA_COLLECTION_NAME);

    const tempDevices = await tempCollection.find().toArray();

    for (const device of tempDevices) {
        for (const uuid of device.DeviceId) {
            const trimmedUuid = String(uuid).trim();
            const rawDeviceData = await rawDataCollection.findOne({ "DeviceUUIDMap.deviceUUID": trimmedUuid });

            if (rawDeviceData) {
                // Retrieve the ACVoltage and ACCurrent fields
                const ACVoltageTargetFields = rawDeviceData.DeviceUUIDMap.ACVoltageTargetFields || [];
                const ACCurrentTargetFields = rawDeviceData.DeviceUUIDMap.ACCurrentTargetFields || [];

                if (ACVoltageTargetFields.length > 0 && ACCurrentTargetFields.length > 0) {
                    // Initialize energy output accumulator
                    let energyOutput = 0;

                    // Calculate energy output for each set of readings
                    for (let i = 0; i < ACVoltageTargetFields.length && i < ACCurrentTargetFields.length; i++) {
                        const vac = ACVoltageTargetFields[i];
                        const iac = ACCurrentTargetFields[i];

                        if (vac && iac) {
                            const vacR = vac.vACR ? vac.vACR : 0;
                            const vacS = vac.vACS ? vac.vACS : 0;
                            const vacT = vac.vACT ? vac.vACT : 0;
                            const iacR = iac.iACR ? iac.iACR : 0;
                            const iacS = iac.iACS ? iac.iACS : 0;
                            const iacT = iac.iACT ? iac.iACT : 0;

                            // Sum up the energy output for all phases
                            energyOutput += (vacR * iacR + vacS * iacS + vacT * iacT) * 900;
                        }
                    }

                    // Finalize energy output calculation
                    energyOutput = energyOutput / 1000; // Convert to KWH

                    const newDoc = {
                        Deviceuid: trimmedUuid,
                        Localdatetime: device.LocalDateTime,
                        Plantid: device.PlantId,
                        Energyoutput: energyOutput.toFixed(2),
                        EnergyUOM: "KWH"
                    };

                    await logToFile("DeviceDataCalc", "DataPrep", "Info", `Calculated data for DeviceUUID: ${trimmedUuid} - ${JSON.stringify(newDoc)}`);
                } else {
                    await logToFile("DeviceDataCalc", "DataPrep", "Error", `ACVoltageTargetFields or ACCurrentTargetFields are empty for DeviceUUID: ${trimmedUuid}`);
                }
            } else {
                await logToFile("DeviceDataCalc", "DataPrep", "Error", `No raw data found for DeviceUUID: ${trimmedUuid}`);
            }
        }
    }
}

// ... [rest of the script remains unchanged] ...

// Ensure to call dfn_temp_devicedata within the context of a database connection, just like the main() function setup.
*/
// ... [other parts of your script remain unchanged] ...


//working part
/*async function dfn_temp_devicedata(database) {
    const tempCollection = database.collection(process.env.MONGODB_TEMP_COLLECTION_NAME);
    const rawDataCollection = database.collection(process.env.MONGODB_RAW_DATA_COLLECTION_NAME);
    const deviceDataCollection = database.collection(process.env.MONGODB_DEVICE_DATA_COLLECTION_NAME);

    const tempDevices = await tempCollection.find().toArray();

    // Calculate current LocalDateTime in IST (UTC+5:30)
    const currentUtcDate = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours and 30 minutes converted to milliseconds
    const istDate = new Date(currentUtcDate.getTime() + istOffset);
    const LocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');
    

    for (const device of tempDevices) {
        for (const uuid of device.DeviceId) {
            const trimmedUuid = String(uuid).trim();

            // Query to match both DeviceUUID and LocalDateTime in IST
            const query = {
                "DeviceUUIDMap.deviceUUID": trimmedUuid,
                "DeviceUUIDMap.LocalDateTime": LocalDateTime  // Use the LocalDateTime in IST
            };

            const rawDeviceData = await rawDataCollection.findOne(query);

            if (rawDeviceData) {
                // Retrieve the ACVoltage and ACCurrent fields
                const ACVoltageTargetFields = rawDeviceData.DeviceUUIDMap.ACVoltageTargetFields || [];
                const ACCurrentTargetFields = rawDeviceData.DeviceUUIDMap.ACCurrentTargetFields || [];

                if (ACVoltageTargetFields.length > 0 && ACCurrentTargetFields.length > 0) {
                    let energyOutput = 0;
                    // Calculate energy output for each set of readings
                    for (let i = 0; i < ACVoltageTargetFields.length && i < ACCurrentTargetFields.length; i++) {
                        const vac = ACVoltageTargetFields[i];
                        const iac = ACCurrentTargetFields[i];

                        if (vac && iac) {
                            const vacR = vac.vACR ? vac.vACR : 0;
                            const vacS = vac.vACS ? vac.vACS : 0;
                            const vacT = vac.vACT ? vac.vACT : 0;
                            const iacR = iac.iACR ? iac.iACR : 0;
                            const iacS = iac.iACS ? iac.iACS : 0;
                            const iacT = iac.iACT ? iac.iACT : 0;

                            energyOutput += (vacR * iacR + vacS * iacS + vacT * iacT) * 900;
                        }
                    }
                    energyOutput = energyOutput / 1000; // Convert to KWH

                    const newDoc = {
                        Deviceuid: trimmedUuid,
                        Localdatetime: device.LocalDateTime,
                        Plantid: device.PlantId,
                        Energyoutput: parseFloat(energyOutput.toFixed(2)),
                        EnergyUOM: "KWH"
                    };

                    // Insert the new document into the Temp_devicedata collection
                    await deviceDataCollection.insertOne(newDoc);
                    await logToFile("DeviceDataInsert", "Insert", "Info", `Inserted calculated data for DeviceUUID: ${trimmedUuid} into Temp_devicedata`);
                } else {
                    await logToFile("DeviceDataCalc", "DataPrep", "Error", `ACVoltageTargetFields or ACCurrentTargetFields are empty for DeviceUUID: ${trimmedUuid}`);
                }
            } else {
                await logToFile("DeviceDataCalc", "DataPrep", "Error", `No raw data found for DeviceUUID: ${trimmedUuid}`);
            }
        }
    }
}
*/

// Function to process device data for energy calculations and store the results in MongoDB
// This function retrieves relevant device data, calculates energy output, and stores the results in a MongoDB collection.
// Written by Vishnu Prasad S
// Written at date: 10-04-2024
async function dfn_temp_devicedata(database)
// Retrieve collection references from MongoDB for temporary, raw, and device data storage
// These collections are used to fetch and store device data
// Written by Vishnu Prasad S
// Written at date: 10-04-2024
{
    const tempCollection = database.collection(process.env.MONGODB_TEMP_COLLECTION_NAME);
    const rawDataCollection = database.collection(process.env.MONGODB_RAW_DATA_COLLECTION_NAME);
    const deviceDataCollection = database.collection(process.env.MONGODB_DEVICE_DATA_COLLECTION_NAME);

    // Calculate the current local date and time in IST timezone (UTC+5:30)
    // This timestamp is used to retrieve and record data relevant to the local time context
    // Written by Vishnu Prasad S
    // Written at date: 10-04-2024    
    const currentUtcDate = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(currentUtcDate.getTime() + istOffset);
    const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

    // Find documents in the temporary collection that match the current local date and time
    // These documents are processed to calculate energy outputs based on AC voltage and current readings
    // Written by Vishnu Prasad S
    // Written at date: 10-04-2024
    const tempDevicesWithCurrentTime = await tempCollection.find({ LocalDateTime: currentLocalDateTime }).toArray();

    for (const device of tempDevicesWithCurrentTime) {
        for (const uuid of device.DeviceId) {
            const trimmedUuid = String(uuid).trim();

            const query = {
                "DeviceUUIDMap.DeviceUUID": trimmedUuid,
                "DeviceUUIDMap.LocalDateTime": device.LocalDateTime
            };
            // Fetch raw device data from the database based on the Device UUID and LocalDateTime
            // Written by Vishnu Prasad S
            // Written at date: 10-04-2024
            const rawDeviceData = await rawDataCollection.findOne(query);

            // Process AC voltage and current data if available
            // Calculates energy output by multiplying voltage and current readings and integrating over time
            // Written by Vishnu Prasad S
            // Written at date: 10-04-2024
            if (rawDeviceData) {
                const ACVoltageTargetFields = rawDeviceData.DeviceUUIDMap.ACVoltageTargetFields;
                const ACCurrentTargetFields = rawDeviceData.DeviceUUIDMap.ACCurrentTargetFields;
                //passing header object
                const header = rawDeviceData.DeviceUUIDMap.HeaderTarget || {};

                if (ACVoltageTargetFields && ACCurrentTargetFields) {
                    const vac = ACVoltageTargetFields;
                    const iac = ACCurrentTargetFields;

                    const energyOutput = (vac.vACR * iac.iACR + vac.vACS * iac.iACS + vac.vACT * iac.iACT) * 900 / 1000;

                    // Construct a new document for insertion into the device data collection
                    // Written by Vishnu Prasad S
                    // Written at date: 10-04-2024
                    const newDoc = {
                        Deviceuid: trimmedUuid,
                        Localdatetime: device.LocalDateTime,
                        Plantid: device.PlantId,
                        Energyoutput: parseFloat(energyOutput.toFixed(2)),
                        EnergyUOM: "KWH",
                        Header: header // Directly passing the header object
                    };

                    // Insert the new document into the MongoDB collection and log the operation
                    // Written by Vishnu Prasad S
                    // Written at date: 10-04-2024
                    await deviceDataCollection.insertOne(newDoc);
                    await logToFile("DeviceDataInsert", "Insert", "Info", `Inserted calculated data for DeviceUUID: ${trimmedUuid} into Temp_devicedata`);
                } else {
                    await logToFile("DeviceDataCalc", "DataPrep", "Error", `ACVoltageTargetFields or ACCurrentTargetFields are empty for DeviceUUID: ${trimmedUuid} at LocaldateTime: ${device.LocalDateTime}`);
                }

            } else {
                await logToFile("DeviceDataCalc", "DataPrep", "Error", `No raw data found for DeviceUUID: ${trimmedUuid} at LocalDateTime: ${device.LocalDateTime}`);
            }
        }
    }
}

// Main function to run the aggregation logic and handle database connections
// Ensures that MongoDB connections are managed properly and logs are generated
// Written by Vishnu Prasad S
// Written at date: 10-04-2024
async function main() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        logToFile("Connected to MongoDB");
        const database = client.db(dbName);
        await aggregateDeviceData(database);
        await dfn_temp_devicedata(database);

    } catch (err) {
        logToFile("Error in main:", err);
    } finally {
        await client.close();
        logToFile("Closed MongoDB connection");
    }
}
// Execute the main function and handle any uncaught exceptions
// Central execution point for the MongoDB aggregation logic
// Written by Vishnu Prasad S
// Written at date: 10-04-2024
main().catch(console.error);


// End of code block


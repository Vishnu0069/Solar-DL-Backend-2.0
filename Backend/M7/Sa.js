require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;

async function logToFile(serviceName, operationType, status, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  try {
    await fs.appendFile('M7.log', logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
}

async function aggregateDeviceData(database) {
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
}

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

async function dfn_temp_devicedata(database) {
    const tempCollection = database.collection(process.env.MONGODB_TEMP_COLLECTION_NAME);
    const rawDataCollection = database.collection(process.env.MONGODB_RAW_DATA_COLLECTION_NAME);
    const deviceDataCollection = database.collection(process.env.MONGODB_DEVICE_DATA_COLLECTION_NAME);  // New collection for device data

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

// ... [rest of the script remains unchanged] ...

// Ensure to call dfn_temp_devicedata within the context of a database connection, just like the main() function setup.



async function main() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db(dbName);
        await logToFile("MongoDB", "Connection", "Success", "Connected to MongoDB");

        await aggregateDeviceData(database);
        await dfn_temp_devicedata(database);

    } catch (err) {
        console.error("Error in main:", err);
        await logToFile("MongoDB", "Operation", "Error", err.message);
    } finally {
        await client.close();
        await logToFile("MongoDB", "Connection", "Closed", "MongoDB connection closed");
    }
}

main().catch(async (error) => {
    console.error(error);
    await logToFile("Script", "Execution", "Error", error.message);
});

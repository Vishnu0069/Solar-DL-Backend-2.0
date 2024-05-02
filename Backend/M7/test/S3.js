/*require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = process.env.MONGODB_DB_NAME;
const plantDataCollectionName = process.env.MONGODB_TEMP_PLANT_COLLECTION_NAME;
const plantEnergyCollectionName = process.env.MONGODB_PLANT_ENERGY_COLLECTION_NAME;

async function main() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db(dbName);

    const specifiedDate = "2024-04-20"; // Manually specify the date here
    await calculateAndStorePlantTotalEnergy(db, specifiedDate);

    console.log("Energy totals calculated and stored successfully.");
  } catch (err) {
    console.error('An error occurred:', err);
    await logToFile('DatabaseOperation', 'Error', 'Failure', err.message);
  } finally {
    await client.close();
  }
}

async function calculateAndStorePlantTotalEnergy(db, specifiedDate) {
    const plantDataCollection = db.collection(plantDataCollectionName);
    const plantEnergyCollection = db.collection(plantEnergyCollectionName);

    const pipeline = [
        { $unwind: "$Plantdata" },
        { $match: { "Plantdata.LocalDateTime": { $regex: `^${specifiedDate}` } } },
        { $group: {
            _id: "$Plantid",
            TotalEnergy: { $sum: "$Plantdata.OutputEnergy" }
        }},
        { $project: {
            _id: 0,
            Plantid: "$_id",
            Date: specifiedDate,
            EnergyOutput: "$TotalEnergy",
            EnergyUnits: {
                $cond: {
                    if: { $lt: ["$TotalEnergy", 100] },
                    then: "Watt",
                    else: {
                        $cond: {
                            if: { $lt: ["$TotalEnergy", 1000] },
                            then: "KWH",
                            else: "MWH"
                        }
                    }
                }
            }
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

async function logToFile(serviceName, operationType, status, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  try {
    await fs.appendFile('M7.log', logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
}

main();*/
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = process.env.MONGODB_DB_NAME;
const plantDataCollectionName = process.env.MONGODB_TEMP_PLANT_COLLECTION_NAME;
const plantEnergyCollectionName = process.env.MONGODB_PLANT_ENERGY_COLLECTION_NAME;
const deviceDataCollectionName = process.env.MONGODB_DEVICE_DATA_COLLECTION_NAME;
const deviceDetailsCollectionName = process.env.MONGODB_COLLECTION_NAME;
const deviceEnergyCollectionName = process.env.MONGODB_DEVICE_ENERGY_COLLECTION_NAME;

async function main() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db(dbName);
    const currentUtcDate = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(currentUtcDate.getTime() + istOffset);
    const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

    //const specifiedDate = "2024-04-20"; // Manually specify the date here
    const specifiedDate = currentLocalDateTime; 

    await calculateAndStorePlantTotalEnergy(db, specifiedDate);
    await fetchAndLogDeviceData(db);

    console.log("Operations completed successfully.");
  } catch (err) {
    console.error('An error occurred:', err);
    await logToFile('DatabaseOperation', 'Error', 'Failure', err.message);
  } finally {
    await client.close();
  }
}

/*async function calculateAndStorePlantTotalEnergy(db, specifiedDate) {
    const plantDataCollection = db.collection(plantDataCollectionName);
    const plantEnergyCollection = db.collection(plantEnergyCollectionName);

    const pipeline = [
        { $unwind: "$Plantdata" },
        { $match: { "Plantdata.LocalDateTime": { $regex: `^${specifiedDate}` } } },
        { $group: {
            _id: "$Plantid",
            TotalEnergy: { $sum: { $divide: ["$Plantdata.OutputEnergy", 1000] } },  // Sum the energy output divided by 1000 for each group
            //TotalEnergy: { $sum: "$Plantdata.OutputEnergy" },
            Header: { $first: "$Header" }
        }},
        { $project: {
            _id: 0,
            Plantid: "$_id",
            Date: specifiedDate,
            EnergyOutput: "$TotalEnergy",
            /*EnergyUnits: {
                $cond: {
                    if: { $lt: ["$TotalEnergy", 100] },
                    then: "Watt",
                    else: {
                        $cond: {
                            if: { $lt: ["$TotalEnergy", 1000] },
                            then: "KWH",
                            else: "MWH"
                        }
                    }
                }

            }
            EnergyUnits: { $literal: "KWH" } , // Statically assign "kWh" as the unit for TotalEnergy
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
}*/
async function calculateAndStorePlantTotalEnergy(db, specifiedDate) {
  const plantDataCollection = db.collection(plantDataCollectionName);
  const plantEnergyCollection = db.collection(plantEnergyCollectionName);

  // Pipeline to aggregate energy data per plant for the specified date
  const pipeline = [
      { $unwind: "$Plantdata" },
      { $match: { "Plantdata.LocalDateTime": { $regex: `^${specifiedDate}` } } },
      { $group: {
          _id: "$Plantid",
          TotalEnergy: { $sum: { $divide: ["$Plantdata.OutputEnergy", 1000] } },  // Convert energy to KWH
          Header: { $first: "$Header" }  // Capture header data from the first document in the group
      }},
      { $project: {
          _id: 0,
          Plantid: "$_id",
          Date: specifiedDate,
          EnergyOutput: "$TotalEnergy",
          EnergyUnits: { $literal: "KWH" },  // Set unit as KWH
          Header: "$Header"  // Include header data in the output
      }}
  ];

  const results = await plantDataCollection.aggregate(pipeline).toArray();

  // Upsert results into the plantEnergyCollection
  for (const result of results) {
      await plantEnergyCollection.updateOne(
          { Plantid: result.Plantid, Date: result.Date },
          { $set: result },
          { upsert: true }  // Upsert option to update or insert
      );
      await logToFile('PlantEnergyCollection', 'UpdateInsert', 'Success', `Processed total energy for plant ${result.Plantid}`);
  }
}


async function fetchAndLogDeviceData(db) {
    const deviceDataCollection = db.collection(deviceDataCollectionName);
    const deviceDetailsCollection = db.collection(deviceDetailsCollectionName);
    const deviceEnergyCollection = db.collection(deviceEnergyCollectionName);
    logToFile("Connected correctly to server");
   
    const currentUtcDate = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    const istDate = new Date(currentUtcDate.getTime() + istOffset);
    const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

    //const specifiedDate = "2024-04-20"; // Manually specify the date here
    const specifiedDate = currentLocalDateTime; // Manually specify the date here

    // Aggregate total energy for each device
    const energyAggregation = await deviceDataCollection.aggregate([
        { $group: {
            _id: "$Deviceuid",
             
            //TotalEnergy: { $sum: "$Energyoutput" },
            TotalEnergy: { $sum: { $divide: ["$Energyoutput", 1000] } },  // Divides each energy output by 1000 before summing
            Plantid: { $first: "$Plantid" },
            Header: { $first: "$Header" }
        }}
    ]).toArray();

    for (const device of energyAggregation) {
        // Find corresponding device details
        const details = await deviceDetailsCollection.findOne({ DeviceUUID: device._id });

        if (details) {
            const finalDoc = {
                PlantID: device.Plantid,
                DeviceID: device._id,
                Date: specifiedDate,
                DeviceSerialNumber: details.DeviceSerialNumber,
                DeviceMake: details.DeviceMake,
                ModelNo: details.ModelNo,
                EnergyOutput: device.TotalEnergy,
                //EnergyUnits: (device.TotalEnergy > 1000 ? "MWH" : "KWH")
                EnergyUnits:"KWH",  // Statically assign "kWh" as the unit for TotalEnergy
                Header: device.Header
          
            
              };

            // Insert or update the document in device energy collection
            await deviceEnergyCollection.updateOne(
                { DeviceID: finalDoc.DeviceID },
                { $set: finalDoc },
                { upsert: true }
            );

            logToFile("Document inserted or updated:", finalDoc);
        } else {
          logToFile(`No details found for device ID ${device._id}`);
        }
    }
}

async function logToFile(serviceName, operationType, status, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  try {
    await fs.appendFile('M7.log', logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
}

main();

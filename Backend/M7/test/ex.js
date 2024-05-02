require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;

// Function to log messages to a log file
async function logToFile(serviceName, operationType, status, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  try {
    await fs.appendFile('M7.log', logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
}

// Function to aggregate device data and insert into a temporary collection
async function aggregateDeviceData(database) {
  const sourceCollection = database.collection(process.env.MONGODB_COLLECTION_NAME);
  const tempCollection = database.collection(process.env.MONGODB_TEMP_COLLECTION_NAME);
  const aggregationPipeline = [
    {
      $group: {
        _id: "$PlantID",
        DeviceUUIDs: { $push: "$DeviceUUID" }
      }
    }
  ];
  const results = await sourceCollection.aggregate(aggregationPipeline).toArray();
  const currentUtcDate = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(currentUtcDate.getTime() + istOffset);
  const LocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

  for (let result of results) {
    const existingAggregate = await tempCollection.findOne({
      PlantId: result._id,
      LocalDateTime: LocalDateTime
    });

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

// Function to find device data, compute energy output, and insert new data
async function dfn_temp_devicedata(database) {
  const tempCollection = database.collection(process.env.MONGODB_TEMP_COLLECTION_NAME);
  const rawDataCollection = database.collection(process.env.MONGODB_RAW_DATA_COLLECTION_NAME);
  const deviceDataCollection = database.collection(process.env.MONGODB_DEVICE_DATA_COLLECTION_NAME);
  const currentUtcDate = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(currentUtcDate.getTime() + istOffset);
  const LocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');
  const tempDevicesWithSpecifiedTime = await tempCollection.find({ LocalDateTime: LocalDateTime }).toArray();
  console.log("Devices found in temp collection:", tempDevicesWithSpecifiedTime.length);

  for (const device of tempDevicesWithSpecifiedTime) {
    for (const uuid of device.DeviceId) {
      const trimmedUuid = String(uuid).trim();
      const query = {
        "DeviceUUIDMap.DeviceUUID": trimmedUuid,
        "DeviceUUIDMap.LocalDateTime": LocalDateTime
      };

      const rawDeviceData = await rawDataCollection.findOne(query);
      if (rawDeviceData) {
        const ACVoltageTargetFields = rawDeviceData.DeviceUUIDMap.ACVoltageTargetFields;
        const ACCurrentTargetFields = rawDeviceData.DeviceUUIDMap.ACCurrentTargetFields;
        const header = rawDeviceData.DeviceUUIDMap.HeaderTarget || {};

        if (ACVoltageTargetFields && ACCurrentTargetFields) {
          const vac = ACVoltageTargetFields;
          const iac = ACCurrentTargetFields;
          const energyOutput = (vac.vACR * iac.iACR + vac.vACS * iac.iACS + vac.vACT * iac.iACT) * 900 / 1000;

          const newDoc = {
            Deviceuid: trimmedUuid,
            Localdatetime: LocalDateTime,
            Plantid: device.PlantId,
            Energyoutput: parseFloat(energyOutput.toFixed(2)),
            EnergyUOM: "KWH",
            Header: header // Directly passing the header object
          };

          // Use updateOne with upsert to prevent duplicates
          await deviceDataCollection.updateOne(
            { Deviceuid: trimmedUuid, Localdatetime: LocalDateTime },
            { $set: newDoc },
            { upsert: true }
          );
          console.log("Inserted or updated document for DeviceUID:", trimmedUuid);
        } else {
          console.error("AC voltage or current fields are empty for DeviceUID:", trimmedUuid);
        }
      } else {
        console.error("No raw data found for DeviceUID:", trimmedUuid, "at LocalDateTime:", LocalDateTime);
      }
    }
  }
}


// Main function to run the script
async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const database = client.db(dbName);
    await aggregateDeviceData(database);
    await dfn_temp_devicedata(database);
  } catch (err) {
    console.error("Error in main:", err);
  } finally {
    await client.close();
    console.log("Closed MongoDB connection");
  }
}

main().catch(console.error);

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = process.env.MONGODB_DB_NAME;
const deviceDataCollectionName = process.env.MONGODB_DEVICE_DATA_COLLECTION_NAME;
const plantDataCollectionName = process.env.MONGODB_TEMP_PLANT_COLLECTION_NAME;
// Calculate current LocalDateTime in IST (UTC+5:30)
const currentUtcDate = new Date();
const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
const istDate = new Date(currentUtcDate.getTime() + istOffset);
const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');
async function main() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db(dbName);
  
    
    // The date and time for the query
    const queryDateTime = currentLocalDateTime;
    //const queryDateTime = "2024-04-19 11-45";

    // Accessing the collection
    const deviceDataCollection = db.collection(deviceDataCollectionName);
    const plantDataCollection = db.collection(plantDataCollectionName);

    // Query for the data
    const cursor = deviceDataCollection.find({ "Localdatetime": queryDateTime });

    /*const plantOutputs = {};

    await cursor.forEach(doc => {
      const plantId = doc.Plantid;
      if (plantOutputs[plantId]) {
        plantOutputs[plantId] += doc.Energyoutput;
      } else {
        plantOutputs[plantId] = doc.Energyoutput;
      }
    });

    // Insert or update the plant data
    for (const [plantId, outputEnergy] of Object.entries(plantOutputs)) {
      const newDoc = {
        Plantid: plantId,
        LocalDateTime: "24-04-19 11-00",  // Example date/time format
        OutputEnergy: outputEnergy,
        EnergyUOM: "KWH"
      };
      await plantDataCollection.insertOne(newDoc);
      await logToFile('PlantDataCollection', 'Insert', 'Success', `Inserted data for plant ${plantId}`);
    }

    console.log("Data processed and inserted successfully.");
  } catch (err) {
    console.error('An error occurred:', err);
    await logToFile('DatabaseOperation', 'Error', 'Failure', err.message);
  } finally {
    await client.close();
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
//This Blocks works justfine creates a object just as we need or inerts the new data into the collection if an object already exists

//to query and get data for currect dateand time
const currentUtcDate = new Date();
const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours and 30 minutes converted to milliseconds
const istDate = new Date(currentUtcDate.getTime() + istOffset);
const LocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

const plantOutputs = {};

    await cursor.forEach(doc => {
      const plantId = doc.Plantid;
      if (plantOutputs[plantId]) {
        plantOutputs[plantId] += doc.Energyoutput;
      } else {
        plantOutputs[plantId] = doc.Energyoutput;
      }
    });

    for (const [plantId, outputEnergy] of Object.entries(plantOutputs)) {
      const newData = {
        LocalDateTime: LocalDateTime,
        OutputEnergy: outputEnergy,
        EnergyUOM: "KWH"
      };

      const updateResult = await plantDataCollection.updateOne(
        { Plantid: plantId },
        { $push: { Plantdata: newData } },
        { upsert: true }
      );

      if (updateResult.upsertedCount > 0 || updateResult.modifiedCount > 0) {
        await logToFile('PlantDataCollection', 'UpdateInsert', 'Success', `Updated/Inserted data for plant ${plantId}`);
      } else {
        await logToFile('PlantDataCollection', 'UpdateInsert', 'NoChange', `No changes made for plant ${plantId}`);
      }
    }

    

    console.log("Data processed and inserted/updated successfully.");
  } catch (err) {
    console.error('An error occurred:', err);
    await logToFile('DatabaseOperation', 'Error', 'Failure', err.message);
  } finally {
    await client.close();
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

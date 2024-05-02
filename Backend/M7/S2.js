// Start of code block

// Import necessary modules for MongoDB operations and asynchronous file operations
// Configures environment variables and sets up MongoDB client
// Written by Vishnu Prasad S
// Written at date: 20-04-2024
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;

// MongoDB URI and client setup for database connections
// Utilizes environment variables for secure access to database resources
// Written by Vishnu Prasad S
// Written at date: 20-04-2024
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Retrieve MongoDB database and collection names from environment variables
// Written by Vishnu Prasad S
// Written at date: 20-04-2024
const dbName = process.env.MONGODB_DB_NAME;
const deviceDataCollectionName = process.env.MONGODB_DEVICE_DATA_COLLECTION_NAME;
const plantDataCollectionName = process.env.MONGODB_TEMP_PLANT_COLLECTION_NAME;

// Function to log messages to a file, enhancing traceability and error handling
// This function captures service operations, statuses, and messages, appending them to a log file
// Written by Vishnu Prasad S
// Written at date: 20-04-2024
async function logToFile(serviceName,logLevel, operationType, status, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  try {
    await fs.appendFile('M7.log', logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
}


// Main function to execute MongoDB operations and data processing
// Connects to the database, processes device data, and updates plant data collections
// Written by Vishnu Prasad S
// Written at date: 20-04-2024
async function main() {
  try {
    logToFile("M7(S2)", "L1","S2 Service", "success", "Started Successfully...")
    // Connect to the MongoDB server using the client

    await client.connect();
    
    logToFile("M7(S2)", "L2","S2 Service", "success","Connected correctly to server");
    const db = client.db(dbName);

    // Access device and plant data collections from the database
    const deviceDataCollection = db.collection(deviceDataCollectionName);
    const plantDataCollection = db.collection(plantDataCollectionName);

    // Calculate the current local date and time in IST (Indian Standard Time, UTC+5:30)
    // This timestamp is crucial for filtering and processing data relevant to the specific time
    // Written by Vishnu Prasad S
    // Written at date: 20-04-2024
    const currentUtcDate = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(currentUtcDate.getTime() + istOffset);
    const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

    // Retrieve data for the current local date and time, summing energy outputs by plant
    // Written by Vishnu Prasad S
    // Written at date: 20-04-2024
    const cursor = deviceDataCollection.find({ "Localdatetime": currentLocalDateTime });

    const plantOutputs = {};
    await cursor.forEach(doc => {
      const plantId = doc.Plantid;
      const header = doc.Header || {}; // Retrieve header if available
      if (plantOutputs[plantId]) {
        plantOutputs[plantId].outputEnergy += doc.Energyoutput;
        plantOutputs[plantId].header = header; // Store header information
      } else {
        plantOutputs[plantId] = { outputEnergy: doc.Energyoutput, header };
      }
    });

    // Update each plant's data in the plant data collection, inserting new data as needed
    // Logs the outcome of each operation, indicating successful updates or insertions
    // Written by Vishnu Prasad S
    // Written at date: 20-04-2024
    for (const [plantId, data] of Object.entries(plantOutputs)) {
      const { outputEnergy, header } = data;
      const updateDoc = {
        $set: { "Header": header },
        $push: {
          "Plantdata": {
            LocalDateTime: currentLocalDateTime,
            OutputEnergy: outputEnergy,
            EnergyUOM: "KWH"
          }
        }
      };

      const updateResult = await plantDataCollection.updateOne(
        { Plantid: plantId },
        updateDoc,
        { upsert: true }
      );

      if (updateResult.upsertedCount > 0 || updateResult.modifiedCount > 0) {
        await logToFile("M7(S2)", "L2","S2 Service", "success", `Updated/Inserted data for plant ${plantId}`);
      } else {
        await logToFile("M7(S2)", "L2","S2 Service", 'NoChange', `No changes made for plant ${plantId}`);
      }
    }

    logToFile("M7(S2)", "L2","S2 Service", "success","Data processed and inserted/updated successfully.");
  } catch (err) {
    //console.error('An error occurred:', err);
    await logToFile("M7(S2)", "L2","S2 Service", "error",'DatabaseOperation', 'Error', 'Failure', err.message);
  } finally {
    await client.close();
    await logToFile("M7(S2)", "L2","S2 Service", "success","Executed successfully")
  }
}
// Execute the main function and handle any uncaught exceptions
// This execution block serves as the entry point for the script, ensuring that database operations are performed
// Written by Vishnu Prasad S
// Written at date: 20-04-2024
main().catch(console.error);
// End of code block

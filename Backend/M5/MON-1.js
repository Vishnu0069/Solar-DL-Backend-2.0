/*
// Start of code block

// Load environment variables from .env file
// This line is essential for accessing sensitive data securely.
// Written by Vishnu Prasad S
require('dotenv').config();
const mysql = require('mysql');
const fs = require('fs');
const { MongoClient } = require('mongodb');

// Logging function
function logToFile(serviceName, operationType, status, message) {
  const now = new Date();
  const timestamp = now.toISOString();
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  fs.appendFileSync('M5.log', logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGO_URI);
let deviceCollection;

async function connectMongoDB() {
  try {
    await mongoClient.connect();
    logToFile("Mon1", "database", "success", "Connected to MongoDB.");
    const db = mongoClient.db(process.env.MONGO_DB_NAME);
    deviceCollection = db.collection(process.env.MONGO_COLLECTION_NAME);
  } catch (error) {
    logToFile("Mon1", "database", "error", `MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit if cannot connect to MongoDB
  }
}

// MySQL database setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect(err => {
  if (err) {
    logToFile("Mon1", "read", "error", `Error connecting to MySQL: ${err.stack}`);
    return;
  }
  logToFile("Mon1", "read", "success", "Connected to MySQL database.");
});

// Function to perform MySQL queries and return a promise
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Function to generate a request serial number
function generateRequestSerial(currentCount) {
  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  return `${dateString}-${currentCount.toString().padStart(6, '0')}`;
}

function calculateNewTime() {
  let now = new Date();
  now.setMinutes(now.getMinutes() - 14);
  let hours = now.getHours().toString().padStart(2, '0');
  let minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
// Fetch device metadata, device and plant details from MySQL and insert into MongoDB
async function fetchAndInsertDeviceData() {
  let requestSerialCounter = 1; // Initialize the request serial counter

  try {
    const metadataList = await query('SELECT EndpointApi1, DeviceTypeID, DeviceMake, Api1Body, HeaderforApi1 FROM DeviceMetadataMaster');
    for (const metadata of metadataList) {
      const deviceList = await query('SELECT DeviceSerialNumber, ModelNo, PlantID, DeviceType, Capacity, Phase, DeviceUUID, modelno, API_Key, Creation_Date_time FROM DeviceMaster WHERE DeviceTypeID = ?', [metadata.DeviceTypeID]);
      for (const device of deviceList) {
        const plant = await query('SELECT PlantID, IntegratorID, API_Key, PlantName, Latitude, Longitude FROM PlantMaster WHERE PlantID = ?', [device.PlantID]);
        const timeVariable = calculateNewTime();
        
        
        const document = {
          ...metadata,
          ...device,
          plant: plant[0], // Assuming there is at least one plant record
          //requestSerialNumber: requestSerialNumber,
          Last_Update_Date: device.Creation_Date_time, // Convert to UTC and extract YYYY-MM-DD
          timeStamp:timeVariable,
          metadata: {
            integratorId: plant[0].IntegratorID,
            plantName: plant[0].PlantName,
            latitude: plant[0].Latitude,
            longitude: plant[0].Longitude,
            PlantID: plant[0].PlantID,
            deviceUUID: device.DeviceUUID, // Use the DeviceUUID from the query
            deviceMake: metadata.DeviceMake,
            deviceType: device.DeviceType,
            capacity: device.Capacity,
            phase: device.Phase,
            modelno: device.modelno,
            API_Key: device.API_Key // Use the API_Key from the deviceList result
          }
        };
        
        
        await deviceCollection.insertOne(document);
        logToFile("Mon1", "write", "success", `Document inserted to MongoDB: ${JSON.stringify(document)}`);
      }
    }
  } catch (error) {
    logToFile("Mon1", "database", "error", `Error during data fetch/insert: ${error.message}`);
  } finally {
    // Close the MySQL connection
    db.end();
    // Close the MongoDB connection when all operations are done
    await mongoClient.close();
  }
}

// Start the process
connectMongoDB().then(() => {
  fetchAndInsertDeviceData();
});*/
//The Above Block Doesn't Cover the New plant data if any is updated yet it does Create a M5 List but Can't get the new device info
// Written by Vishnu Prasad S


//The Below code doesn't Stop after writing the M5 List it listens to a port(3000) and checks for 
//any new plant data is availabe if yes it writes to the M5 list 
// Written by Vishnu Prasad S



// Start of code block

// Load environment variables from .env file
// Essential for accessing configuration and sensitive details securely.
// Written by Vishnu Prasad S
// Written at date: 16-02-2024
require('dotenv').config();
const mysql = require('mysql');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const cron = require('node-cron');

// Logging function to track application activities and errors
// Writes each log entry with a timestamp to 'M5.log'.
// Written by Vishnu Prasad S
// Written at date: 16-02-2024
function logToFile(serviceName, logLevel,operationType, status, message) {
  const now = new Date();
  const timestamp = now.toISOString();
  const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  fs.appendFileSync('M5.log', logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

// Setup MongoDB client and define variables for collection handling
// Connects to MongoDB to manage device data.
// Written by Vishnu Prasad S
// Written at date: 16-02-2024
const mongoClient = new MongoClient(process.env.MONGO_URI);
let deviceCollection;
let greatestCreationDate = new Date(0); // Initialize with a minimum date

async function connectMongoDB() {
  try {
    await mongoClient.connect();
    logToFile("Mon1", "L1","MON-1 Service", "success", "Started Successfully...")
    logToFile("Mon1", "L2","database", "success", "Connected to MongoDB.");
    const db = mongoClient.db(process.env.MONGO_DB_NAME);
    deviceCollection = db.collection(process.env.MONGO_COLLECTION_NAME);
  } catch (error) {
    logToFile("Mon1", "L2","database", "error", `MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit if cannot connect to MongoDB
  }
}

// Setup MySQL connection
// Connects to MySQL database for retrieving initial and ongoing device data.
// Written by Vishnu Prasad S
// Written at date: 16-02-2024
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect(err => {
  if (err) {
    logToFile("Mon1", "L2","read", "error", `Error connecting to MySQL: ${err.stack}`);
    return;
  }
  logToFile("Mon1", "L2","read", "success", "Connected to MySQL database.");
});

// Function to execute MySQL queries and return results as a promise
// Used for asynchronously fetching device data based on criteria.
// Written by Vishnu Prasad S
// Written at date: 16-02-2024
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

/*// Function to generate a request serial number
function generateRequestSerial(currentCount) {
  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  return `${dateString}-${currentCount.toString().padStart(6, '0')}`;
}
*/

//function to calculate time
// Written by Vishnu Prasad S
/*function calculateNewTime() {
  let now = new Date();
  now.setMinutes(now.getMinutes() - 14);
  let hours = now.getHours().toString().padStart(2, '0');
  let minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}*/

// Function to periodically fetch and insert new device data
// Checks for device updates in MySQL and inserts new data into MongoDB.
// Written by Vishnu Prasad S
// Written at date: 16-02-2024
async function fetchAndInsertGreaterDeviceData() {
  // Log the beginning of the data fetching process to help in debugging and monitoring
  logToFile("Fetching and inserting greater device data...");
  try {
    // Start with the current greatest creation date to ensure we only fetch new entries
    let maxCreationDate = greatestCreationDate; // Start with the current greatestCreationDate

    // Query metadata for all devices to prepare for detailed device data fetching
    const metadataList = await query('SELECT EndpointApi1, DeviceTypeID, DeviceMake, Api1Body, HeaderforApi1 FROM DeviceMetadataMaster');
    for (const metadata of metadataList) {
      // For each type of device, fetch details of new devices since the last known creation date
      const deviceList = await query('SELECT DeviceSerialNumber, ModelNo, PlantID, DeviceType, capacity, deviceserialnumber, capacity_uom, DeviceUUID, modelno, API_Key, Creation_Date_time FROM DeviceMaster WHERE DeviceTypeID = ? AND Creation_Date_time > ?', [metadata.DeviceTypeID, greatestCreationDate]);
      for (const device of deviceList) {
        // Fetch related plant data for each device
        const plant = await query('SELECT PlantID, PlantType, SystemType, IntegratorID, API_Key, PlantName, Latitude, Longitude, plant_serialno, capacity_uom, Capacity, azimuthal_angle, tilt_angle, Country, Region, State, District FROM PlantMaster WHERE PlantID = ?', [device.PlantID]);
        // Construct a document to be inserted into MongoDB
        // This document combines device metadata, detailed device data, and related plant data
        const document = {
          ...metadata,
          ...device,
          //plant: plant[0], // Assuming there is at least one plant record
          //requestTime: calculateNewTime(),
          metadata: {
            integratorId: plant[0].IntegratorID,
            plantName: plant[0].PlantName,
            PlantSystemType: plant[0].SystemType,
            PlantType: plant[0].PlantType,
            PlantID: plant[0].PlantID,
            PlantSL_NO: plant[0].plant_serialno,
            Plant_capacity: plant[0].Capacity,
            Capacity_UOM: plant[0].capacity_uom,
            Azimuthal_angle: plant[0].azimuthal_angle,
            Tilt_angle: plant[0].tilt_angle,
            Country: plant[0].Country,
            Region: plant[0].Region,
            State: plant[0].State,
            District: plant[0].District,
            latitude: plant[0].Latitude,
            longitude: plant[0].Longitude,
            deviceUUID: device.DeviceUUID, // Use the DeviceUUID from the query
            deviceMake: metadata.DeviceMake,
            deviceType: device.DeviceType,
            deviceModelno: device.modelno,
            deviceSrialno: device.deviceserialnumber,
            deviceCapacity: device.capacity,
            deviceCapacity_uom: device.capacity_uom,
            API_Key: device.API_Key // Use the API_Key from the deviceList result

          }
        };

        await deviceCollection.insertOne(document);
        
        logToFile("Mon1","L2", "write", "success", `Document inserted to MongoDB: ${JSON.stringify(document)}`);
        logToFile("Mon1", "L1","MON-1 Service", "success", "Executed Successfully...")
        // Update maxCreationDate if the current Creation_Date_time is greater
        if (device.Creation_Date_time > maxCreationDate) {
          maxCreationDate = device.Creation_Date_time;
        }
      }
    }
    // After all new data has been processed, update the global tracker of the latest creation date
    greatestCreationDate = maxCreationDate;
  } catch (error) {
    console.error("Error during greater data fetch/insert:", error);
    logToFile("Mon1","L2", "database", "error", `Error during greater data fetch/insert: ${error.message}`);
  }
}

// Function to check for new device entries in the MySQL database since the last recorded creation date
// This function queries for devices with a creation timestamp greater than the most recently known timestamp and updates if new devices are found
// Written by Vishnu Prasad S
// Written at date: 23-04-2024
async function latestCreationDate() {
  try {
    // Query the MySQL database for devices that have been created since the last known greatest creation date
    // This check helps in determining whether new device data needs to be fetched and inserted into MongoDB
    const latestDevices = await query('SELECT DeviceSerialNumber, ModelNo, PlantID, DeviceType, Capacity, Phase, DeviceUUID, modelno, API_Key, Creation_Date_time FROM DeviceMaster WHERE Creation_Date_time > ?', [greatestCreationDate]);
    // If new devices are found, call the function to fetch and insert this greater device data into MongoDB
    // This ensures that the MongoDB database remains up-to-date with the latest device information
    if (latestDevices.length > 0) {
      await fetchAndInsertGreaterDeviceData();
    } else {
      // Log information if no new devices are found since the last check
      // This log entry helps in monitoring the activity and ensuring the system is functioning as expected
      logToFile("Mon1", "L2","latestCreationDate", "info", "No new devices found.");
    }
  } catch (error) {
    // Log any errors that occur during the operation
    // Errors here could indicate issues with the database connection or the query execution
    console.error("Error during latestCreationDate:", error);
    logToFile("Mon1","L2", "latestCreationDate", "error", `Error during latestCreationDate: ${error.message}`);
  }
}

// Start the process
connectMongoDB().then(() => {

  fetchAndInsertGreaterDeviceData();
});

// Schedule the function to check for new devices every 15 minutes
// Utilizes node-cron for periodic checks.
// Written by Vishnu Prasad S
// Written at date: 16-02-2024
/*cron.schedule('/15 * * * *', () => {
  latestCreationDate();
});*/
const interval = process.env.T_INTERVAL || 15; // Default to 15 if T_INTERVAL is not set

// Validate the interval to be a number and convert it to a cron string
const cronInterval = `*/${interval} * * * *`;

cron.schedule(cronInterval, () => {
  console.log(`Running job every ${interval} minutes`);
  latestCreationDate();
});

// Setup HTTP server to keep the script running
// Listens on a specified port to ensure the script continues to execute.
// Written by Vishnu Prasad S
// Written at date: 16-02-2024
const PORT = process.env.PORT || 3000;
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('MON-1.js is running and listening.');
});

server.listen(PORT, () => {
  console.log(`MON-1.js is running and listening on port ${PORT}`);
});

//End of the code
/*In SUmmary the above Code Stores a the date-time when it's run initailly it'll get all the data
from the MysQl and Write to M5 List in mongodb after this it'll not end the program but will execute every 15 mins and
if it finds any new Device data found which has date-time higher then what we stored while running initially it'll update that
Device details into the M5 List.. */
// Written by Vishnu Prasad S
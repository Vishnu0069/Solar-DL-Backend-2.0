// Start of code block

// Load environment variables from .env file
// This line loads the configuration from the .env file into the process environment.
// Written by Vishnu Prasad S
require('dotenv').config();

// Importing necessary libraries
// Written by Vishnu Prasad S
const mysql = require('mysql');
const axios = require('axios');
const cron = require('node-cron');
const { spawn } = require('child_process');

// Create a MySQL database connection
// Establishes connection with the MySQL database using credentials from .env file.
// Written by Vishnu Prasad S
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Connect to the database and log any errors
// Written by Vishnu Prasad S
db.connect(err => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Function to perform database queries and return a promise
// Allows for asynchronous database operations.
// Written by Vishnu Prasad S
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Function to get device metadata from the DeviceMetadataMaster table
// This function now also retrieves Api1Body and HeaderforApi1 for each device
// Updated by Vishnu Prasad S to include additional fields necessary for API calls
async function getDeviceMetadataMaster() {
  return query('SELECT EndpointApi1, DeviceTypeID, DeviceMake, Api1Body, HeaderforApi1 FROM DeviceMetadataMaster');
}


// Retrieves device details by device type ID
// Gets serial number, model number, and plant ID for devices of a given type.
// Written by Vishnu Prasad S
async function getDeviceMaster(deviceTypeId) {
  return query(
    `SELECT DeviceSerialNumber, ModelNo, PlantID, DeviceType, Capacity, Phase, DeviceUUID, modelno 
     FROM DeviceMaster 
     WHERE DeviceTypeID = ?`, 
    [deviceTypeId]
  );
}

// Retrieves plant details by plant ID
// Fetches plant ID, integrator ID, and API key for a given plant.
// Written by Vishnu Prasad S
async function getPlantMaster(plantId) {
  return query(
    'SELECT PlantID, IntegratorID, API_Key, PlantName, Latitude, Longitude, PlantID FROM PlantMaster WHERE PlantID = ?', 
    [plantId]
  );
}

// Generates a request serial number based on the current date and counter
// The serial number includes the date and a padded counter value.
// Written by Vishnu Prasad S
function generateRequestSerial(currentCount) {
  const date = new Date();
  const dateString = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;
  return `${dateString}${currentCount.toString().padStart(9, '0')}`;
}

// Calculates a new time 14 minutes before the current moment
// Used for creating time-based request parameters.
// Written by Vishnu Prasad S
function calculateNewTime() {
  let now = new Date();
  now.setMinutes(now.getMinutes() - 14);
  let hours = now.getHours().toString().padStart(2, '0');
  let minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Main function to log device details
// Fetches device data, constructs requests, and sends them to an endpoint.
// Written by Vishnu Prasad S
/*async function logDeviceDetails() {
  let requestSerialCounter = 1;
  const metadataList = await getDeviceMetadataMaster();
  for (const metadata of metadataList) {
    const deviceList = await getDeviceMaster(metadata.DeviceTypeID);
    for (const device of deviceList) {
      const plant = await getPlantMaster(device.PlantID);
      const timeVariable = calculateNewTime();
      const requestData = {
        ...metadata,
        ...device,
        ...plant[0],
        requestTime: timeVariable,
        requestSerialNumber: generateRequestSerial(requestSerialCounter++),
        integratorId: plant[0].IntegratorID,  // Added field for integratorId
        PlantId: device.PlantID              // Added field for PlantId

      };*/
      async function logDeviceDetails() {
        let requestSerialCounter = 1;
        const metadataList = await getDeviceMetadataMaster();
        for (const metadata of metadataList) {
          const deviceList = await getDeviceMaster(metadata.DeviceTypeID);
          for (const device of deviceList) {
            const plant = await getPlantMaster(device.PlantID);
            const timeVariable = calculateNewTime();
            const requestData = {
              ...metadata,
              ...device,
              ...plant[0],
              requestTime: timeVariable,
              requestSerialNumber: generateRequestSerial(requestSerialCounter++),
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
                modelno:device.modelno
              }
            };
      //updated block to send the correct metadata
            await axios.post('http://localhost:3000/api/submitData', requestData)
              .then(response => console.log('Data submitted to Mon2:', response.data))
              .catch(error => console.error('Error submitting data to Mon2:', error));
          }
        }
      }
      
      


// Manages the Monitor 2 process
// Starts or restarts the Monitor 2 service as needed to ensure it's running fresh for each data push.
// Written by Vishnu Prasad S
let mon2Process = null;
function manageMon2() {
  // Check if Monitor 2 process is already running
  if (mon2Process) {
    console.log('Monitor 2 is already running. Ensuring it is fresh.');
    // Kill the existing process to restart it
    mon2Process.kill();
    mon2Process = null;
  }

  // Log starting of Monitor 2 and spawn a new process for Monitor 2
  console.log('Starting Monitor 2...');
  mon2Process = spawn('node', ['./Mon2.js'], { stdio: 'inherit' });

  // Handle any errors that occur when starting Monitor 2
  mon2Process.on('error', (error) => {
    console.error('Failed to start Monitor 2:', error);
  });

  // Log when Monitor 2 process exits and set the process variable to null
  mon2Process.on('close', (code) => {
    console.log(`Monitor 2 process exited with code ${code}`);
    mon2Process = null;
  });

  // Wait for 10 seconds assuming Monitor 2 is ready, then proceed to fetch and send data
  setTimeout(() => {
    console.log('Assuming Monitor 2 is ready now. Proceeding to fetch and send data...');
    logDeviceDetails();
  }, 10000); // 10 seconds delay to ensure Monitor 2 is fully up and ready
}

// Schedule a cron job to activate Monitor 2 and push data every 3 minutes
// This ensures data is regularly fetched and sent without manual intervention.
// Written by Vishnu Prasad S
cron.schedule('*/1 * * * *', () => {
  console.log('Activating Monitor 2 and pushing data every 3 minutes');
  manageMon2();
});

// Initial log to indicate that the scheduler has been set up successfully
// Indicates readiness to execute scheduled tasks.
// Written by Vishnu Prasad S
console.log('Scheduler set to activate Monitor 2 and push data every 3 minutes. Ready to execute.');

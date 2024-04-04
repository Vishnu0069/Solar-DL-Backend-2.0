require('dotenv').config();
const mysql = require('mysql');
const axios = require('axios');
const cron = require('node-cron');
const { spawn } = require('child_process');

// Create a MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect(err => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

async function getDeviceMetadataMaster() {
  return query('SELECT EndpointApi1, DeviceTypeID, DeviceMake, Api1Body, HeaderforApi1 FROM DeviceMetadataMaster');
}

async function getDeviceMaster(deviceTypeId) {
  return query(
    'SELECT DeviceSerialNumber, ModelNo, PlantID, DeviceType, Capacity, Phase FROM DeviceMaster WHERE DeviceTypeID = ?', 
    [deviceTypeId]
  );
}

async function getPlantMaster(plantId) {
  return query(
    'SELECT PlantID, IntegratorID, API_Key, PlantName, Latitude, Longitude, PlantID FROM PlantMaster WHERE PlantID = ?', 
    [plantId]
  );
}

function generateRequestSerial(currentCount) {
  const date = new Date();
  const dateString = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;
  return `${dateString}${currentCount.toString().padStart(9, '0')}`;
}

function calculateNewTime() {
  let now = new Date();
  now.setMinutes(now.getMinutes() - 14);
  let hours = now.getHours().toString().padStart(2, '0');
  let minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

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
          deviceUUID: device.DeviceSerialNumber,
          deviceMake: metadata.DeviceMake,
          deviceType: device.DeviceType,
          capacity: device.Capacity,
          phase: device.Phase
        }
      };

      await axios.post('http://localhost:3000/api/submitData', requestData)
        .then(response => console.log('Data submitted to Mon2:', response.data))
        .catch(error => console.error('Error submitting data to Mon2:', error));
    }
  }
}

let mon2Process = null;
function manageMon2() {
  if (mon2Process) {
    mon2Process.kill();
    mon2Process = null;
  }
  
  console.log('Starting Monitor 2...');
  mon2Process = spawn('node', ['./Mon2.js'], { stdio: 'inherit' });
  
  mon2Process.on('error', (error) => {
    console.error('Failed to start Monitor 2:', error);
  });
  
  mon2Process.on('close', (code) => {
    console.log(`Monitor 2 process exited with code ${code}`);
    mon2Process = null;
  });
  

  setTimeout(() => {
    logDeviceDetails();
  }, 10000); // Delay to ensure Mon2 is ready
}

cron.schedule('*/1 * * * *', () => {
  console.log('Activating Monitor 2 and pushing data every 3 minutes');
  manageMon2();
});

console.log('Scheduler set to activate Monitor 2 and push data every 3 minutes. Ready to execute.');

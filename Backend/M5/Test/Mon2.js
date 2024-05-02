// Load environment variables from .env file
require('dotenv').config();

// Import necessary libraries
const express = require('express');
const crypto = require('crypto');
const { Container } = require('rhea-promise');
const fs = require('fs');
// Initialize Express app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Updated Logging function with improved datetime formatting
function logToFile(serviceName, operationType, status, message) {
  const now = new Date();
  const timestamp = now.toISOString(); // UTC datetime in ISO format, e.g., "2023-04-01T12:00:00.000Z"
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

  fs.appendFile('M5.log', logMessage, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
}
// Function to send message to ActiveMQ queue
const sendMessageToQueue = async (queueName, messageBody) => {
  const container = new Container();
  try {
    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: 'tcp', // Change to 'ssl' for SSL connections
    });

    const sender = await connection.createSender(queueName);
    await sender.send({ body: messageBody });
    logToFile("Mon2", "write", "success", `Message sent to ${queueName}`);
    //console.log(`Message sent to ${queueName}`);

    await sender.close();
    await connection.close();
  } catch (error) {
    logToFile("Mon2", "write", "error", `Failed to send message to queue: ${error.message}`);
    //console.error('Failed to send message to queue:', error);
  }
};

// POST route for /api/submitData
app.post('/api/submitData', async (req, res) => {
  let constructedUrl = '';


  // Define a headers object that will be populated as needed
let headers = {};

  // Switch based on the DeviceMake field in the request body, converted to lower case
  // Written by Vishnu Prasad S
  switch (req.body.DeviceMake.toLowerCase()) {
    // Case for 'solaredge' devices
    // Written by Vishnu Prasad S
    case 'solaredge':
            // Construct URL for SolarEdge devices including start and end times
            // Written by Vishnu Prasad S
            const today = new Date().toISOString().split('T')[0]; // Gets today's date in YYYY-MM-DD format
            const startTime = req.body.requestTime + ':00'; // Appends :00 to received time for seconds
            const formattedStartTime = `${today}%20${startTime}`; // Formats start time with %20 for space

            // Calculates and formats end time by adding 15 minutes to the start time
            // Written by Vishnu Prasad S
            const requestTimeDate = new Date(`${today}T${req.body.requestTime}:00`);
            requestTimeDate.setMinutes(requestTimeDate.getMinutes() + 15);
            let endTime = `${requestTimeDate.getHours().toString().padStart(2, '0')}:${requestTimeDate.getMinutes().toString().padStart(2, '0')}:00`;
            const formattedEndTime = `${today}%20${endTime}`;

            // Constructs the full URL with API key
            // Written by Vishnu Prasad S
            constructedUrl = `${req.body.EndpointApi1}/${req.body.ModelNo}/${req.body.DeviceSerialNumber}/data?startTime=${formattedStartTime}&endTime=${formattedEndTime}&api_key=${req.body.API_Key}`;
            break;
    // Case for 'solis' devices
    // Written by Vishnu Prasad S
    case 'solis':
    // Construct headers and body for the Solis devices API request
    const apiId = req.body.API_Key;
    const contentMd5 = JSON.parse(req.body.HeaderforApi1)["Content-MD5"];
    const contentType = 'application/json';
    const date = new Date().toUTCString();
    const requestBody = JSON.parse(req.body.Api1Body);

    const apiEndpoint = process.env.API_URL;
    const stringToSign = `POST\n${contentMd5}\n${contentType}\n${date}\n${apiEndpoint}`;
    
    const secretKey = process.env.SECRET_KEY;
    const signature = crypto.createHmac('sha1', secretKey).update(stringToSign).digest('base64');

    constructedUrl = `${req.body.EndpointApi1}`;

    // Populate the headers object with necessary details for Solis
    headers = {
      "Content-MD5": contentMd5,
      "Content-Type": contentType,
      "Date": date,
      "Signature": signature,
      "Api_key"  : apiId,
      "body": requestBody
        };

    console.log('Constructed URL for Solis:', constructedUrl, 'Headers:', headers, 'Request Body:', requestBody);
    break;
    // Case for 'solarman' devices, assuming similar URL construction for demonstration
    // Written by Vishnu Prasad S
    case 'solarman':
      constructedUrl = `${req.body.EndpointApi1}?api_key=${req.body.API_Key}`;
      break;
    // Default case if the DeviceMake is not recognized
    // Written by Vishnu Prasad S
    default:
      console.log(`DeviceMake ${req.body.DeviceMake} not recognized. No URL constructed.`);
      break;
  }

  // Construct response data including the constructed URL
  // Written by Vishnu Prasad S
 // Construct response data including the constructed URL and additional metadata
// Written by Vishnu Prasad S
const responseData = {
  ...req.body,
  constructedUrl: constructedUrl ? constructedUrl : 'Not applicable',
    
  
};

  // Log the response data including the URL
  // Written by Vishnu Prasad S
  //console.log('Data with constructed URL:', responseData);
  logToFile("Mon2", "write", "success", `Data with constructed URL: ${JSON.stringify(responseData)}`);
// Constructing message for the queue including metadata
const messageData = {
  deviceMake: req.body.DeviceMake,
  constructedUrl: constructedUrl,
  headers: headers,
  metadata: { // Sending additional metadata
  integratorId : req.body.IntegratorID,//adding integratorId
  PlantName : req.body.PlantName,
  PlantID:req.body.PlantID,//adding plantid
  deviceUUID:req.body.DeviceUUID,
  modelno:req.body.modelno,
  deviceSN: req.body.DeviceSerialNumber,//adding DeviceSerialNumber
  DeviceType:req.body.DeviceType,//adding Devicetype
  Capacity:req.body.Capacity,//adding capacity
  Phase:req.body.Phase,//adding phase
  Latitude:req.body.Latitude,//adding Latitude
  Longitude:req.body.Longitude//adding Longitude

  }

};

// Sending message to the /request queue
try {
  await sendMessageToQueue('/request', JSON.stringify(messageData));
  logToFile("Mon2", "write", "success", "Data enqueued successfully.");
  //console.log('Data enqueued successfully.');
  res.status(200).send('Data received and enqueued successfully.');
} catch (error) {
  logToFile("Mon2", "write", "error", `Error enqueuing data: ${error.message}`);
  //console.error('Error enqueuing data:', error);
  res.status(500).send('Failed to enqueue data.');
}
});
// Starting the Express server
app.listen(port, () => {
  console.log(`Mon2 service listening at http://localhost:${port}`);
  });

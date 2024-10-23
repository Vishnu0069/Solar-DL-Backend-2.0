
// Start of code block

// Load environment variables from .env file
// This line is essential for accessing sensitive data securely.
// Written by Vishnu Prasad S 
//Written on Date 25-02-2024

require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { Container } = require('rhea-promise');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
// Function to append log entries to a file
// Logs service name, operation type, status, and messages with a timestamp for troubleshooting and monitoring.
// Written by Vishnu Prasad S
// Written on Date 25-02-2024
// async function logToFile(serviceName,logLevel, operationType, status, message) {
//     const timestamp = new Date().toISOString();
//     const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
//     fs.appendFileSync('M5.log', logMessage);
// }
// Updated Logging function with improved datetime formatting
function logToFile(serviceName, logLevel, operationType, status, message) {
    const now = new Date();
    const timestamp = now.toISOString(); // UTC datetime in ISO format, e.g., "2023-04-01T12:00:00.000Z"
    const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

    // Ensure the logs directory exists
    const logDirectory = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

    // Write the log message to M5.log inside the logs directory
    const logFilePath = path.join(logDirectory, 'mon2.log');
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });
}
// Function to send constructed message data to an ActiveMQ queue
// This function prepares and sends data crucial for making subsequent API calls to retrieve device data.
// Written by Vishnu Prasad S
// Written on Date 25-02-2024
async function sendMessageToQueue(queueName, messageData) {
    const container = new Container();
    try {
        const connection = await container.connect({
            host: process.env.ACTIVE_MQ_HOST,
            port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
            username: process.env.ACTIVE_MQ_USERNAME,
            password: process.env.ACTIVE_MQ_PASSWORD,
            transport: 'tcp',
        });
        const sender = await connection.createSender(queueName);
        await sender.send({ body: JSON.stringify(messageData) });
        await logToFile("Mon2", "L1","MON-2 Service", "success", "Executed Successfully...");
        await logToFile("Mon2", "L2","write", "success", `Message sent to ${queueName}: ${JSON.stringify(messageData)}`);
        await sender.close();
        await connection.close();
    } catch (error) {
        await logToFile("Mon2","L2", "write", "error", `Failed to send message to queue: ${error.message}`);
    }
}

// Function to fetch and process data from MongoDB
// Retrieves device data from the MongoDB collection and processes it to extract essential information for API calls.
// Written by Vishnu Prasad S
// Written on Date 25-02-2024
async function fetchAndProcessData() {
    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGO_DB_NAME);
    const collection = db.collection(process.env.MONGO_COLLECTION_NAME);
    const cursor = collection.find({});

    while (await cursor.hasNext()) {
        const document = await cursor.next();
        let constructedUrl = '', headers = {};
        const { DeviceMake, API_Key, EndpointApi1, DeviceSerialNumber, ModelNo } = document;

        /*switch (DeviceMake.toLowerCase()) {
          case 'solaredge':
            // Adapted for MongoDB document structure
            const today = new Date().toISOString().split('T')[0]; // Gets today's date in YYYY-MM-DD format
            
            // Assuming `requestTime` is stored in the document, similar to `document.requestTime`
            // It looks like the error might be occurring because `document.requestTime` is not correctly formatted or missing
            // Make sure `document.requestTime` exists and is correctly formatted (HH:mm)
            const startTime = document.requestTime + ':00'; // Appends :00 to received time for seconds
            const formattedStartTime = `${today}%20${startTime}`; // Formats start time with %20 for space
            
            // Calculates and formats end time by adding 15 minutes to the start time
            const requestTimeDate = new Date(`${today}T${document.requestTime}:00`);
            requestTimeDate.setMinutes(requestTimeDate.getMinutes() + 15);
            let endTime = `${requestTimeDate.getHours().toString().padStart(2, '0')}:${requestTimeDate.getMinutes().toString().padStart(2, '0')}:00`;
            const formattedEndTime = `${today}%20${endTime}`;
            
            // Constructs the full URL with API key
            // Assuming `EndpointApi1`, `ModelNo`, `DeviceSerialNumber`, and `API_Key` are correctly extracted from the MongoDB document
            constructedUrl = `${document.EndpointApi1}/${document.ModelNo}/${document.DeviceSerialNumber}/data?startTime=${formattedStartTime}&endTime=${formattedEndTime}&api_key=${document.API_Key}`;
            break;*/
        switch (DeviceMake.toLowerCase()) {
            /*case 'solaredge':
              
              const now = new Date(); // Gets the current time
              const today = now.toISOString().split('T')[0]; // Gets today's date in YYYY-MM-DD format
      
              // Format the current start time to HH:mm:00
              const currentStartTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
              const formattedStartTime = `${today}%20${currentStartTime}`; // Formats start time with %20 for space
      
              // Calculates and formats end time by adding 15 minutes to the current time
              now.setMinutes(now.getMinutes() + 15);
              const endTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
              const formattedEndTime = `${today}%20${endTime}`;
              
              
  
              
              // Constructs the full URL with API key
              // Assuming `EndpointApi1`, `ModelNo`, `DeviceSerialNumber`, and `API_Key` are correctly extracted from the MongoDB document
              constructedUrl = `${document.EndpointApi1}/${document.ModelNo}/${document.DeviceSerialNumber}/data?startTime=${formattedStartTime}&endTime=${formattedEndTime}&api_key=${document.API_Key}`;
              break;*/
            case 'solaredge':
                /*const now = new Date(); // Gets the current time
                const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000); // Converts local time to UTC time
            
                const today = utcNow.toISOString().split('T')[0]; // Gets today's date in YYYY-MM-DD format
            
                // Format the current start time to HH:mm:00 in UTC timezone
                const currentStartTime = `${utcNow.getUTCHours().toString().padStart(2, '0')}:${utcNow.getUTCMinutes().toString().padStart(2, '0')}:00`;
                const formattedStartTime = `${today}%20${currentStartTime}`; // Formats start time with %20 for space
            
                // Calculates and formats end time by adding 15 minutes to the current time
                const endTime = new Date(utcNow.getTime() + 15 * 60000); // Adds 15 minutes to the current UTC time
                const formattedEndTime = `${endTime.getUTCFullYear()}-${(endTime.getUTCMonth() + 1).toString().padStart(2, '0')}-${endTime.getUTCDate().toString().padStart(2, '0')}%20${endTime.getUTCHours().toString().padStart(2, '0')}:${endTime.getUTCMinutes().toString().padStart(2, '0')}:00`;
             */

                // Get current UTC date and time
                const nowUtc = new Date();

                // Formats the current start time to YYYY-MM-DD%20HH:MM:00 in UTC
                const formattedStartTime = `${nowUtc.getUTCFullYear()}-${(nowUtc.getUTCMonth() + 1).toString().padStart(2, '0')}-${nowUtc.getUTCDate().toString().padStart(2, '0')}%20${nowUtc.getUTCHours().toString().padStart(2, '0')}:${nowUtc.getUTCMinutes().toString().padStart(2, '0')}:00`;

                // Calculate and format end time by adding 15 minutes to the current UTC time
                const endTimeUtc = new Date(nowUtc.getTime() + 15 * 60000); // Adds 15 minutes to the current UTC time
                const formattedEndTime = `${endTimeUtc.getUTCFullYear()}-${(endTimeUtc.getUTCMonth() + 1).toString().padStart(2, '0')}-${endTimeUtc.getUTCDate().toString().padStart(2, '0')}%20${endTimeUtc.getUTCHours().toString().padStart(2, '0')}:${endTimeUtc.getUTCMinutes().toString().padStart(2, '0')}:00`;

                // Constructs the full URL with API key
                constructedUrl = `${document.EndpointApi1}/${document.ModelNo}/${document.DeviceSerialNumber}/data?startTime=${formattedStartTime}&endTime=${formattedEndTime}&api_key=${document.API_Key}`;
                break;


            case 'solis':

                const apiId = document.API_Key;
                const contentMd5 = JSON.parse(document.HeaderforApi1)["Content-MD5"];
                const contentType = 'application/json';
                const currentDate = new Date().toUTCString();
                const requestBody = JSON.parse(document.Api1Body);

                // Use the API endpoint from environment variable or document if it's stored there
                const apiEndpoint = process.env.API_URL;
                const stringToSign = `POST\n${contentMd5}\n${contentType}\n${currentDate}\n${apiEndpoint}`;

                const secretKey = process.env.SECRET_KEY;
                const signature = crypto.createHmac('sha1', secretKey).update(stringToSign).digest('base64');

                // Constructed URL using data from the MongoDB document
                constructedUrl = `${document.EndpointApi1}`;

                // Populate the headers object with necessary details for Solis, extracted from the document
                headers = {
                    "Content-MD5": contentMd5,
                    "Content-Type": contentType,
                    "Date": currentDate,
                    "Signature": signature,
                    "Api_key": apiId,
                    "body": requestBody // Ensure that requestBody is in the correct format expected by the endpoint
                };

                // Log the constructed URL and headers for debugging
                //console.log('Constructed URL for Solis:', constructedUrl, 'Headers:', headers, 'Request Body:', JSON.stringify(requestBody));
                break;

            case 'solarman':
                // Replicate Solarman URL construction logic
                constructedUrl = `${EndpointApi1}?api_key=${API_Key}`;
                break;
            default:
                console.log(`DeviceMake ${DeviceMake} not recognized.`);
                continue;
        }

        //Constructing the messagedata to be sent into the Queue
        //Written by Vishnu Prasad S
        //Written on Date 25-02-2024
        const messageData = {
            deviceMake: document.DeviceMake,
            constructedUrl,
            headers,
            metadata: {
                /*integratorId: document.metadata.integratorId,
                PlantName: document.metadata.plantName, // Note the capitalization of 'plantName'
                PlantID: document.PlantID,
                deviceUUID: document.DeviceUUID,
                modelno: document.modelno,
                deviceSN: document.DeviceSerialNumber,
                DeviceType: document.DeviceType,
                Capacity: document.Capacity,
                Phase: document.Phase,
                Latitude: document.metadata.latitude,
                Longitude: document.metadata.longitude*/

                //New updated Metadata with Everything from int id to Capaciyu UOM of Device
                //Written by Vishnu Prasad S
                //Written on Date 07-03-2024

                integratorId: document.metadata.integratorId,
                PlantName: document.metadata.plantName,
                PlantSL_NO: document.metadata.PlantSL_NO, // Serial number of the plant
                PlantID: document.metadata.PlantID,
                PlantType: document.metadata.PlantType,
                PlantCapacity: document.metadata.Plant_capacity,
                PlantSystemType: document.metadata.PlantSystemType,
                Latitude: document.metadata.latitude,
                Longitude: document.metadata.longitude,
                Country: document.metadata.Country,
                Region: document.metadata.Region,
                State: document.metadata.State,
                District: document.metadata.District,
                AzimuthalAngle: document.metadata.Azimuthal_angle, // Naming convention adjusted
                TiltAngle: document.metadata.Tilt_angle, // Naming convention adjusted
                DeviceUUID: document.metadata.deviceUUID, // Corrected to match your latest metadata key names
                DeviceMake: document.metadata.deviceMake, // Device manufacturer
                ModelNo: document.metadata.deviceModelno, // Adjusted to 'ModelNo' for consistency
                DeviceSN: document.metadata.deviceSrialno, // Adjusted to 'DeviceSN' for consistency
                DeviceType: document.metadata.deviceType,
                Capacity: document.metadata.deviceCapacity,
                CapacityUOM: document.metadata.deviceCapacity_uom, // Added Capacity Unit of Measure
                //Phase: document.metadata.Phase,



            }
        };
        //Send the message to the /request Queue
        //Written by Vishnu Prasad S
        //Written on Date 25-02-2024
        await sendMessageToQueue('/request', messageData);
        logToFile("Mon2", "L1","MON-2 Service", "success", "Started Successfully...")
    }
    await mongoClient.close();
}



// calling the function to Start processing
// Written by Vishnu Prasad S 
//Written on Date 25-02-2024
fetchAndProcessData().catch(console.error);
//End of the code
/*In SUmmary the above Code gets the device data essential for Making Api call like Api endpoint
Api Key,Devoce Slno and model Number etc which are cruscial for making a Api call and constructs a Url to which the next
M5.js service will make a call over internet to get the latest data from that device... */
// Written by Vishnu Prasad S



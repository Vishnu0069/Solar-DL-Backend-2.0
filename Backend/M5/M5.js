// Start of code block

// Load environment variables from .env file
// This line is essential for accessing sensitive data securely.
// Written by Vishnu Prasad S
//Written at date: 29-03-2024
require('dotenv').config();

// Importing necessary modules for AMQP protocol and HTTPS requests
// Written by Vishnu Prasad S
//Written at date: 29-03-2024
const { Container } = require('rhea-promise');
const https = require('https');
const axios = require('axios');
const fs = require('fs');
// Updated Logging function with improved datetime formatting
function logToFile(serviceName, logLevel,operationType, status, message) {
    const now = new Date();
    const timestamp = now.toISOString(); // UTC datetime in ISO format, e.g., "2023-04-01T12:00:00.000Z"
    const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

    fs.appendFile('M5.log', logMessage, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });
}

// Function to send a message to a topic
// This function establishes a connection to ActiveMQ, sends a message, and then closes the connection.
// Written by Vishnu Prasad S
//Written at date: 29-03-2024
const sendMessageToTopic = async (messageBody) => {
    // Create a new container instance for AMQP communication
    // Written by Vishnu Prasad S
    //Written at date: 29-03-2024
    const container = new Container();
    try {
        // Establish connection to ActiveMQ using credentials and host details from environment variables
        // Written by Vishnu Prasad S
        //Written at date: 29-03-2024
        const connection = await container.connect({
            host: process.env.ACTIVE_MQ_HOST,
            port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
            username: process.env.ACTIVE_MQ_USERNAME,
            password: process.env.ACTIVE_MQ_PASSWORD,
            transport: 'tcp'
        });
        // Create a sender to send messages to the '/response' topic
        // Written by Vishnu Prasad S
        //Written at date: 29-03-2024
        const sender = await connection.createSender('/response');
        // Send the message with the provided message body
        // Written by Vishnu Prasad S
        //Written at date: 29-03-2024
        await sender.send({ body: messageBody });
        //console.log('Message sent to /response topic');
        logToFile("M5", "L1","M5 Service", "success", "Started Successfully...")
        logToFile("M5", "L2","write", "success", `Message successfully sent to /response topic`);//${(messageBody)}
        // Close the sender and connection to clean up resources
        // Written by Vishnu Prasad S
        //Written at date: 29-03-2024
        await sender.close();
        await connection.close();
    }
    // Log any errors encountered during message sending
    // Written by Vishnu Prasad S
    //Written at date: 29-03-2024
    catch (error) {
        //console.error('Failed to send message to /response topic:', error);
        logToFile("M5", "L1","M5 Service", "success", "Error executing...")
        logToFile("M5", "L2","write", "error", "Failed to send message to /response topic: " + error.message);
    }
};
// End of code block


// Start of code block

// Function to listen to a queue for messages
// This function sets up a listener for incoming messages on a specified queue and processes those messages accordingly.
// Written by Vishnu Prasad S
//Written at date: 29-03-2024
const listenToQueue = async () => {
    // Create a new container instance for AMQP communication
    // Written by Vishnu Prasad S
    //Written at date: 29-03-2024
    const container = new Container();
    try {
        // Establish connection to ActiveMQ using credentials and host details from environment variables
        // Written by Vishnu Prasad S
        //Written at date: 29-03-2024
        const connection = await container.connect({
            host: process.env.ACTIVE_MQ_HOST,
            port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
            username: process.env.ACTIVE_MQ_USERNAME,
            password: process.env.ACTIVE_MQ_PASSWORD,
            transport: 'tcp'
        });
        // Define options for creating a receiver, specifying the source queue
        // Written by Vishnu Prasad S
        //Written at date: 29-03-2024


        const receiverOptions = {
            source: {
                address: '/request'
            }
        };
        // Create a receiver for listening to messages from the specified queue
        // Written by Vishnu Prasad S
        //Written at date: 29-03-2024


        const receiver = await connection.createReceiver(receiverOptions);
        // Event listener for handling incoming messages
        // Parses the message body and logs it, then makes API calls based on the device make
        // Written by Vishnu Prasad S
        //Written at date: 29-03-2024
        receiver.on('message', async (context) => {
            // Parse the message body to a JSON object

            const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
            logToFile("M5", "L1","M5 Service", "success", "Started Successfully...")
            logToFile("M5","L2", "read", "success", "Received message: " + JSON.stringify(messageBody));
            //console.log('Received message:', messageBody);
            // Destructure necessary information from the message body
            // Written by Vishnu Prasad S
            //Written at date: 29-03-2024
            const { deviceMake, constructedUrl, metadata, integratorId, PlantID, DeviceSerialNumber } = messageBody;
            // Process the message based on the device make
            // Written by Vishnu Prasad S
            //Written at date: 29-03-2024
            switch (deviceMake.toLowerCase()) {
                case 'solaredge':
                    https.get(constructedUrl, (res) => {
                        let data = '';
                        res.on('data', (chunk) => { data += chunk; });
                        res.on('end', async () => {
                            logToFile("M5","L2", "read", "success", "Response from SolarEdge API: " + data);
                            //console.log('Response from SolarEdge API:', data);
                            const responsePayload = {
                                deviceMake: 'solaredge',
                                metadata,
                                responseData: JSON.parse(data)
                            };
                            await sendMessageToTopic(JSON.stringify(responsePayload));
                            //logToFile("M5", "read", "Success", "Success Solaredge " + responsePayload )
                        });
                    }).on('error', (err) => { //console.error('Error calling SolarEdge API:', err); 
                        logToFile("M5", "L2","read", "error", "Error calling SolarEdge API: " + err.message);
                    });
                    break;
                // Placeholder for other device makes
                case 'solis': {
                    // Extracting necessary data from the received message
                    const { constructedUrl, headers } = messageBody;
                    const { 'Content-MD5': contentMD5, 'Content-Type': contentType, Date: date, Signature: signature, Api_key: apiKey, body } = headers;

                    // Convert the body object to JSON string as axios will automatically set Content-Type to json
                    const requestBody = JSON.stringify(body);

                    // Preparing the Authorization header
                    const authHeader = `API ${apiKey}:${signature}`;

                    // Making the POST request to the Solis API
                    axios.post(constructedUrl, requestBody, {
                        headers: {
                            'Content-MD5': contentMD5,
                            'Content-Type': contentType,
                            'Date': date,
                            'Authorization': authHeader
                        }
                    })
                        .then(async (response) => {
                            //console.log('Response from Solis API:', JSON.stringify(response.data, null, 2));
                            //logToFile("M5", "read", "success", "Response from Solis API: " + JSON.stringify(response.data, null, 2));
                            const responsePayload = {
                                deviceMake: 'solis',
                                metadata,
                                responseData: response.data
                            };
                            await sendMessageToTopic(JSON.stringify(responsePayload));
                            //logToFile("M5", "read", "Success", "Success Solis " + responsePayload )
                        })
                        .catch(error => {
                            logToFile("M5", "L2","read", "error", "Error making API call to Solis: " + error.message);
                            //console.error('Error making API call to Solis:', error.message);
                        });
                    break;
                }
                default:
                    logToFile("M5", "L2","read", "error", "DeviceMake not recognized. No API call made.");
                    //console.log('DeviceMake not recognized. No API call made.');
                    break;
            }
            context.delivery.accept();
        });
        logToFile("M5", "L2","listen", "success", "M5 is listening for messages on /request...");
        //console.log('M5 is listening for messages on /request...');
    } catch (error) {
        logToFile("M5", "L2","connect", "error", "Failed to connect or listen to queue: " + error.message);
        //console.error('Failed to connect or listen to queue:', error);
    }
};
//End of the code
/*In SUmmary the above Code Recives the data like URl request body and much more data essential for making Api calls  */
// Written by Vishnu Prasad S
//Written at date: 29-03-2024

listenToQueue().catch(console.error);

//The below Code is outdated the above one is the latest one
// Written by Vishnu Prasad S
//Written at date: 27-03-2024
/*require('dotenv').config();
const { Container } = require('rhea-promise');
const https = require('https');
const axios = require('axios');
const fs = require('fs');

function logToFile(serviceName, operationType, status, message) {
    const now = new Date();
    const timestamp = now.toISOString(); // UTC datetime in ISO format, e.g., "2023-04-01T12:00:00.000Z"
    const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

    fs.appendFile('M5.log', logMessage, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });
}

const sendMessageToTopic = async (messageBody) => {
    const container = new Container();
    try {
        const connection = await container.connect({
            host: process.env.ACTIVE_MQ_HOST,
            port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
            username: process.env.ACTIVE_MQ_USERNAME,
            password: process.env.ACTIVE_MQ_PASSWORD,
            transport: 'tcp'
        });
        const sender = await connection.createSender('/response');
        await sender.send({ body: messageBody });
        logToFile("M5", "write", "success", `Message sent to /response topic: ${messageBody}`);
        await sender.close();
        await connection.close();
    } catch (error) {
        logToFile("M5", "write", "error", "Failed to send message to /response topic: " + error.message);
    }
};

const listenToQueue = async () => {
    const container = new Container();
    try {
        const connection = await container.connect({
            host: process.env.ACTIVE_MQ_HOST,
            port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
            username: process.env.ACTIVE_MQ_USERNAME,
            password: process.env.ACTIVE_MQ_PASSWORD,
            transport: 'tcp'
        });
        const receiverOptions = {
            source: { address: '/request' }
        };
        const receiver = await connection.createReceiver(receiverOptions);
        receiver.on('message', async (context) => {
            const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
            logToFile("M5", "read", "success", "Received message: " + JSON.stringify(messageBody));
            const { deviceMake, constructedUrl } = messageBody;

            if (deviceMake.toLowerCase() === 'solaredge') {
                https.get(constructedUrl, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', async () => {
                        logToFile("M5", "read", "success", "Response from SolarEdge API: " + data);
                        const responsePayload = { deviceMake: 'solaredge', responseData: JSON.parse(data) };
                        await sendMessageToTopic(JSON.stringify(responsePayload));
                    });
                }).on('error', (err) => {
                    logToFile("M5", "read", "error", "Error calling SolarEdge API: " + err.message);
                });
            }
            context.delivery.accept();

            // Check if it's time to shut down the service after handling the message
            // This is a simple example where we close after a specific condition or message
            if (messageBody.shouldTerminate) {
                await receiver.close();
                await connection.close();
                process.exit(0); // Exit the process once all operations are completed
            }
        });

        logToFile("M5", "listen", "success", "M5 is listening for messages on /request...");
    } catch (error) {
        logToFile("M5", "connect", "error", "Failed to connect or listen to queue: " + error.message);
    }
};

listenToQueue().catch(console.error);
*/
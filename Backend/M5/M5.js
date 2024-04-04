// Start of code block

// Load environment variables from .env file
// This line is essential for accessing sensitive data securely.
// Written by Vishnu Prasad S
require('dotenv').config();

// Importing necessary modules for AMQP protocol and HTTPS requests
// Written by Vishnu Prasad S
const { Container } = require('rhea-promise');
const https = require('https');
const axios = require('axios');

// Function to send a message to a topic
// This function establishes a connection to ActiveMQ, sends a message, and then closes the connection.
// Written by Vishnu Prasad S
const sendMessageToTopic = async (messageBody) => {
    // Create a new container instance for AMQP communication
    // Written by Vishnu Prasad S
    const container = new Container();
    try {
        // Establish connection to ActiveMQ using credentials and host details from environment variables
        // Written by Vishnu Prasad S
        const connection = await container.connect({
            host: process.env.ACTIVE_MQ_HOST,
            port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
            username: process.env.ACTIVE_MQ_USERNAME,
            password: process.env.ACTIVE_MQ_PASSWORD,
            transport: 'tcp'
        });
        // Create a sender to send messages to the '/response' topic
        // Written by Vishnu Prasad S
        const sender = await connection.createSender('/response');
        // Send the message with the provided message body
        // Written by Vishnu Prasad S
        await sender.send({ body: messageBody });
        console.log('Message sent to /response topic');

        // Close the sender and connection to clean up resources
        // Written by Vishnu Prasad S
        await sender.close();
        await connection.close();
    } 
    // Log any errors encountered during message sending
    // Written by Vishnu Prasad S
    catch (error) {
        console.error('Failed to send message to /response topic:', error);
    }
};
// End of code block


// Start of code block

// Function to listen to a queue for messages
// This function sets up a listener for incoming messages on a specified queue and processes those messages accordingly.
// Written by Vishnu Prasad S
const listenToQueue = async () => {
    // Create a new container instance for AMQP communication
    // Written by Vishnu Prasad S
    const container = new Container();
    try {
        // Establish connection to ActiveMQ using credentials and host details from environment variables
        // Written by Vishnu Prasad S
        const connection = await container.connect({
            host: process.env.ACTIVE_MQ_HOST,
            port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
            username: process.env.ACTIVE_MQ_USERNAME,
            password: process.env.ACTIVE_MQ_PASSWORD,
            transport: 'tcp'
        });
        // Define options for creating a receiver, specifying the source queue
        // Written by Vishnu Prasad S
        const receiverOptions = {
            source: {
                address: '/request'
            }
        };
        // Create a receiver for listening to messages from the specified queue
        // Written by Vishnu Prasad S

        const receiver = await connection.createReceiver(receiverOptions);
        // Event listener for handling incoming messages
        // Parses the message body and logs it, then makes API calls based on the device make
        // Written by Vishnu Prasad S
        receiver.on('message', async (context) => {
            // Parse the message body to a JSON object
            const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
            console.log('Received message:', messageBody);
            // Destructure necessary information from the message body
            // Written by Vishnu Prasad S
            const { deviceMake, constructedUrl, metadata, integratorId, PlantID,DeviceSerialNumber } = messageBody;
            // Process the message based on the device make
            // Written by Vishnu Prasad S
            switch (deviceMake.toLowerCase()) {
                case 'solaredge':
                    https.get(constructedUrl, (res) => {
                        let data = '';
                        res.on('data', (chunk) => { data += chunk; });
                        res.on('end', async () => {
                            console.log('Response from SolarEdge API:', data);
                            const responsePayload = {
                                deviceMake: 'solaredge',
                                metadata,

                                responseData: JSON.parse(data)
                            };
                            await sendMessageToTopic(JSON.stringify(responsePayload));
                        });
                    }).on('error', (err) => { console.error('Error calling SolarEdge API:', err); });
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
                        console.log('Response from Solis API:', JSON.stringify(response.data, null, 2));
                        const responsePayload = {
                            deviceMake: 'solis',
                            metadata,
                            responseData: response.data
                        };
                        await sendMessageToTopic(JSON.stringify(responsePayload));
                    })
                    .catch(error => {
                        console.error('Error making API call to Solis:', error.message);
                    });
                    break;
                }
                default:
                    console.log('DeviceMake not recognized. No API call made.');
                    break;
            }
            context.delivery.accept();
        });

        console.log('M5 is listening for messages on /request...');
    } catch (error) {
        console.error('Failed to connect or listen to queue:', error);
    }
};

listenToQueue().catch(console.error);

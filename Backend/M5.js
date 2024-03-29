require('dotenv').config();
const { Container } = require('rhea-promise');
const https = require('https'); // Add the https module for making HTTP/S requests
const axios = require('axios'); // Make sure to import axios at the top

const listenToQueue = async () => {
  const container = new Container();
  try {
    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10), // Ensure port is a number
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: 'tcp' // Change to 'ssl' for SSL connections if necessary
    });

    const receiverOptions = {
      source: {
        address: '/request'
      }
    };

    const receiver = await connection.createReceiver(receiverOptions);

    receiver.on('message', context => {
      const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
      console.log('Received message:', messageBody);

      // Handle the message based on DeviceMake
      switch (messageBody.deviceMake.toLowerCase()) {
        case 'solaredge':
          // Example of making a GET request for SolarEdge devices
          const url = messageBody.constructedUrl; // Assuming constructedUrl is complete and includes any necessary query parameters
          
          https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => { console.log('Response from SolarEdge API:', data); });
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
          .then(response => {
            console.log('Response from Solis API:', JSON.stringify(response.data, null, 2));

            // Proceed with acknowledging the message or further processing
          })
          .catch(error => {
            console.error('Error making API call to Solis:', error.message);
            // Handle the error accordingly
          });
        
          break;
        }
        
        // Add more cases as needed

        default:
          console.log('DeviceMake not recognized. No API call made.');
          break;
      }

      // Acknowledge the message if required by your ActiveMQ configuration
      context.delivery.accept();
    });

    console.log('M5 is listening for messages on /request...');
  } catch (error) {
    console.error('Failed to connect or listen to queue:', error);
  }
};

listenToQueue().catch(console.error);

require('dotenv').config();
const { Container } = require('rhea-promise');
const https = require('https');
const axios = require('axios');

// Function to send a message to a topic
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
        console.log('Message sent to /response topic');

        await sender.close();
        await connection.close();
    } catch (error) {
        console.error('Failed to send message to /response topic:', error);
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
            source: {
                address: '/request'
            }
        };

        const receiver = await connection.createReceiver(receiverOptions);

        receiver.on('message', async (context) => {
            const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
            console.log('Received message:', messageBody);

            const { deviceMake, constructedUrl, headers, body, integratorId, PlantID } = messageBody;

            switch (deviceMake.toLowerCase()) {
                case 'solaredge':
                    https.get(constructedUrl, (res) => {
                        let data = '';
                        res.on('data', (chunk) => { data += chunk; });
                        res.on('end', async () => {
                            console.log('Response from SolarEdge API:', data);
                            const responsePayload = {
                                deviceMake: 'solaredge',
                                integratorId,
                                PlantID,
                                responseData: JSON.parse(data)
                            };
                            await sendMessageToTopic(JSON.stringify(responsePayload));
                        });
                    }).on('error', (err) => { console.error('Error calling SolarEdge API:', err); });
                    break;
                case 'solis':
                    const requestBody = JSON.stringify(body);
                    const authHeader = `API ${headers.Api_key}:${headers.Signature}`;

                    axios.post(constructedUrl, requestBody, {
                        headers: {
                            'Content-MD5': headers['Content-MD5'],
                            'Content-Type': headers['Content-Type'],
                            'Date': headers.Date,
                            'Authorization': authHeader
                        }
                    })
                    .then(async (response) => {
                        console.log('Response from Solis API:', JSON.stringify(response.data, null, 2));
                        const responsePayload = {
                            deviceMake: 'solis',
                            integratorId,
                            PlantID,
                            responseData: response.data
                        };
                        await sendMessageToTopic(JSON.stringify(responsePayload));
                    })
                    .catch(error => {
                        console.error('Error making API call to Solis:', error.message);
                    });
                    break;
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

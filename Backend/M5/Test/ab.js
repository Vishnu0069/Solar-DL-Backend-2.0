require('dotenv').config();
const { Container } = require('rhea-promise');
const fs = require('fs');

function logToFile(serviceName, operationType, status, message) {
    const now = new Date();
    const timestamp = now.toISOString(); // UTC datetime in ISO format, e.g., "2023-04-01T12:00:00.000Z"
    const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

    fs.appendFile('M5.log', logMessage, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });
}

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
            // Here you can process the message received from the queue
            // For simplicity, we are just logging the message
            console.log('Received message:', messageBody);
            context.delivery.accept();
        });
        logToFile("M5", "listen", "success", "M5 is listening for messages on /request...");
    } catch (error) {
        logToFile("M5", "connect", "error", "Failed to connect or listen to queue: " + error.message);
    }
};

listenToQueue().catch(console.error);

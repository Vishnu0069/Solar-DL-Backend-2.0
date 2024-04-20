require('dotenv').config();
const { Container } = require('rhea-promise');
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function logToFile(serviceName, operationType, status, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  fs.appendFileSync('M6.log', logMessage);
}

const listenToTopic = async () => {
  const container = new Container();
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.MONGODB_DB_NAME);
    const collection = database.collection(process.env.MONGODB_COLLECTION_NAME);
    logToFile("Mon6", "database", "success", "Connected to MongoDB.");

    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: 'tcp' // or 'ssl' for secure connections
    });

    const receiverOptions = {
      source: {
        address: '/response', // The topic name you want to subscribe to
        durable: 2, // Use durable subscription if needed
        expiry_policy: 'never'
      }
    };

    const receiver = await connection.createReceiver(receiverOptions);
    logToFile("Mon6", "ActiveMQ", "subscribe", 'Subscribed to /response topic and waiting for messages...');


    receiver.on('message', async context => {
      const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
      logToFile("Mon6", "database", "success",'Received message:', JSON.stringify(messageBody, null, 2));

      try {
        // Assuming the DeviceUUID is in the message body under metadata
        const deviceUUID = messageBody.metadata ? messageBody.metadata.DeviceUUID : 'unknown';

        // Insert the message into MongoDB with a reference to the DeviceUUID
        const result = await collection.insertOne({  messageBody });
        logToFile("Mon6", "database", "success",`Inserted document with _id: ${result.insertedId}`);
      } catch (err) {
        console.error('Error inserting document:', err);
      }
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or listen to topic:', error);
  }
};

listenToTopic().catch(console.error);
//to terminate itself
/*require('dotenv').config();
const { Container } = require('rhea-promise');
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function logToFile(serviceName, operationType, status, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  fs.appendFileSync('M6.log', logMessage);
}

const listenToTopic = async () => {
  const container = new Container();
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.MONGODB_DB_NAME);
    const collection = database.collection(process.env.MONGODB_MAPPINGS_COLLECTION);//MONGODB_COLLECTION_NAME
    logToFile("M6", "database", "success", "Connected to MongoDB.");

    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: 'tcp', // or 'ssl' for secure connections
    });

    const receiverOptions = {
      source: {
        address: '/response', // The topic name you want to subscribe to
        durable: 2, // Use durable subscription if needed
        expiry_policy: 'never',
      },
    };

    const receiver = await connection.createReceiver(receiverOptions);
    logToFile("M6", "ActiveMQ", "subscribe", 'Subscribed to /response topic and waiting for messages...');

    receiver.on('message', async context => {
      const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
      logToFile("M6", "database", "success", 'Received message:', JSON.stringify(messageBody, null, 2));

      try {
        // Insert the message into MongoDB
        const result = await collection.insertOne({ messageBody });
        logToFile("M6", "database", "success", `Inserted document with _id: ${result.insertedId}`);

        // Close connections and exit after processing a message
        await receiver.close();
        await connection.close();
        await client.close();
        logToFile("M6", "shutdown", "success", "Processed a message and exiting.");
        process.exit();
      } catch (err) {
        console.error('Error inserting document:', err);
      }
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or listen to topic:', error);
  }
};

listenToTopic().catch(console.error);*/

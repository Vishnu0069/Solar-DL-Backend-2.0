require('dotenv').config();
const { Container } = require('rhea-promise');
const { MongoClient } = require('mongodb');

async function logToFile(serviceName, operationType, status, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

  fs.appendFile('mon6.log', logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

const listenToTopic = async () => {
  const container = new Container();
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.MONGODB_DB_NAME);
    const mappingsCollection = database.collection(process.env.MONGODB_MAPPINGS_COLLECTION);
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
    logToFile('Subscribed to /response topic and waiting for messages...');

    receiver.on('message', async context => {
      const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
      logToFile("Mon6", "database", "success",'Received message:', JSON.stringify(messageBody, null, 2));

      try {
        // Assuming the DeviceUUID is in the message body under metadata
        const deviceUUID = messageBody.metadata ? messageBody.metadata.DeviceUUID : 'unknown';

        // Retrieve the field mapping from MongoDB based on the device make
        const fieldMapping = await mappingsCollection.findOne({ deviceMake: messageBody.deviceMake });

        // Apply the field mapping to the message data
        const mappedData = applyFieldMapping(messageBody, fieldMapping);

        // Insert the mapped data into MongoDB
        const result = await database.collection('raw_data_store').insertOne({ deviceUUID, mappedData });
        logToFile("Mon6", "database", "success", `Inserted document with _id: ${result.insertedId}`);
      } catch (err) {
        console.error('Error inserting document:', err);
      }
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or listen to topic:', error);
  }
};

listenToTopic().catch(console.error);

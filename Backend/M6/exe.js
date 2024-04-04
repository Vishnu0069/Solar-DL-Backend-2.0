require('dotenv').config();
const { Container } = require('rhea-promise');
const { MongoClient } = require('mongodb');

const listenToTopic = async () => {
  const container = new Container();

  // Set up MongoDB connection
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected successfully to MongoDB');
    const database = client.db(process.env.MONGODB_DB_NAME);
    const mappingsCollection = database.collection(process.env.MONGODB_MAPPINGS_COLLECTION);

    // Retrieve field mappings (modify this to suit how your mappings are stored)
    const fieldMappings = await mappingsCollection.find({}).toArray();
    console.log('Field mappings retrieved:', fieldMappings);

    // Now that we have the mappings, we can connect to ActiveMQ and start listening
    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: 'tcp' // or 'ssl' for secure connections
    });
    console.log('Connected successfully to ActiveMQ');

    const receiverOptions = {
      source: {
        address: '/response', // The topic name you want to subscribe to
        durable: 2, // Use durable subscription if needed
        expiry_policy: 'never'
      }
    };

    const receiver = await connection.createReceiver(receiverOptions);
    console.log('Subscribed to /response topic and waiting for messages...');

    receiver.on('message', context => {
      const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};

      // TODO: Implement your field mapping logic here using `fieldMappings`
      // This is where you would normalize and store your data in MongoDB
      console.log('Received message on /response topic:', JSON.stringify(messageBody, null, 2));

      // Placeholder for field mapping logic
      // const mappedData = mapFields(messageBody, fieldMappings);
      // saveToMongoDB(mappedData);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB or listen to topic:', error);
  } finally {
    // Keeping the connection open for the purpose of this example
    // You might want to handle this differently based on your app's needs
  }
};

listenToTopic().catch(console.error);

// Helper function to map fields (to be implemented)
function mapFields(data, mappings) {
  // Your mapping logic here
}

// Helper function to save data to MongoDB (to be implemented)
function saveToMongoDB(data) {
  // Your MongoDB insert logic here
}

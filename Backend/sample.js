require('dotenv').config();
const { Container } = require('rhea-promise');

const listenToTopic = async () => {
  const container = new Container();
  try {
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

    receiver.on('message', context => {
      const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
      console.log('Received message on /response topic:', messageBody);
    });

    console.log('Subscribed to /response topic and waiting for messages...');
  } catch (error) {
    console.error('Failed to connect or listen to topic:', error);
  }
};

listenToTopic().catch(console.error);

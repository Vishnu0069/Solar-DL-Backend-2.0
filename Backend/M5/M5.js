require('dotenv').config();
const { Container } = require('rhea-promise');

const listenToQueue = async () => {
  const container = new Container();
  try {
    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: 5672, // Default AMQP port, adjust if different
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: 'tcp' // or 'ssl' for secure connections
    });

    const receiverOptions = {
      source: {
        address: '/request'
      }
    };

    const receiver = await connection.createReceiver(receiverOptions);

    receiver.on('message', context => {
      const message = context.message;
      console.log('Received message:', message.body ? message.body.toString() : null);
      // Acknowledge the message if required by your ActiveMQ configuration
      context.delivery.accept();
    });

    console.log('M5 is listening for messages on /request...');
  } catch (error) {
    console.error('Failed to connect or listen to queue:', error);
  }
};

listenToQueue().catch(console.error);

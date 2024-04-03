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
      transport: process.env.ACTIVE_MQ_TRANSPORT // 'tcp' or 'ssl'
    });

    const receiverOptions = {
      source: {
        address: 'topic://response', // Ensure this matches the topic used in M5
        durable: 2, // For durable subscriptions, if needed
        expiry_policy: 'never' // To keep the subscription active
      }
    };

    const receiver = await connection.createReceiver(receiverOptions);

    receiver.on('message', context => {
      const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
      console.log('Received message on /response topic:', JSON.stringify(messageBody, null, 2));
      context.delivery.accept(); // Acknowledge the message if required
    });

    console.log('Subscribed to /response topic and waiting for messages...');
  } catch (error) {
    console.error('Failed to connect or listen to topic:', error);
  }
};

listenToTopic().catch(console.error);

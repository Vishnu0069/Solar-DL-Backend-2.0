const { Container, ReceiverEvents } = require('rhea-promise');
require('dotenv').config();

const container = new Container();
const queueName = '/request'; // Ensure this matches your queue name in the broker

async function main() {
  try {
    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: 'tcp', // Use 'ssl' if your broker connection is secured
    });

    const receiver = await connection.createReceiver({ source: queueName });

    receiver.on(ReceiverEvents.message, (context) => {
      const incomingMessage = context.message;
      console.log(`Received message: ${incomingMessage.body}`);
      // Process the message as needed
    });

    console.log(`Listening for messages on ${queueName}...`);
  } catch (error) {
    console.error('Failed to listen to queue:', error);
  }
}

main().catch(console.error);

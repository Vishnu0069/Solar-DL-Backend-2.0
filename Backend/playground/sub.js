const { Container } = require('rhea-promise');

async function receiveMessages() {
    const container = new Container();
    let connection;

    try {
      connection = await container.connect({
          host: '89.116.122.98',
          port: 5672, // Default AMQP port, adjust if different
          username: 'root',
          password: 'itsVishnu@12345678',
          transport: 'tcp' // or 'ssl' for secure connections
      });

        const receiverOptions = {
            source: {
                address: 'exampleQueue'
            }
        };

        const receiver = await connection.createReceiver(receiverOptions);

        receiver.on('message', (context) => {
            const message = context.message;
            console.log('Received message:', message.body);
            // Manual acknowledgment if required by your ActiveMQ configuration
            // context.delivery.accept();
        });

        console.log('Waiting for messages. To exit press CTRL+C');
    } catch (error) {
        console.error('Error in receiving messages:', error);
    }
    // No need to explicitly close the connection here, as the receiver is intended to keep running.
}

receiveMessages().catch(console.error);

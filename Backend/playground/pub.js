const { Container } = require('rhea-promise');

async function sendMessage() {
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

        const senderOptions = {
            target: {
                address: 'exampleQueue'
            }
        };

        const sender = await connection.createSender(senderOptions);

        const message = {
            body: 'Hello, ActiveMQ!',
            content_type: 'text/plain'
        };

        await sender.send(message);
        console.log('Message sent to exampleQueue');
    } catch (error) {
        console.error('Error in sending message:', error);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

sendMessage().catch(console.error);

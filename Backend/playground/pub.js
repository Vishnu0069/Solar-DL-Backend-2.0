const mqtt = require('mqtt');

// Replace 'mqtt://<your-ec2-instance-ip>' with the actual IP address of your EC2 instance running ActiveMQ
const client = mqtt.connect('mqtt://172.31.2.216');

client.on('connect', function () {
    console.log('Publisher connected to MQTT broker');
    setInterval(() => {
        const message = 'Hello, MQTT!';
        client.publish('test', message);
        console.log('Message published:', message);
    }, 2000); // Publish a message every 2 seconds
});

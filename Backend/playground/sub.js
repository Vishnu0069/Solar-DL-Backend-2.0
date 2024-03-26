const mqtt = require('mqtt');

// Replace 'mqtt://<your-ec2-instance-ip>' with the actual IP address of your EC2 instance running ActiveMQ
const client = mqtt.connect('mqtt://172.31.2.216');

client.on('connect', function () {
    console.log('Subscriber connected to MQTT broker');
    client.subscribe('test', function (err) {
        if (err) {
            console.error('Error subscribing to topic:', err);
        }
    });
});

client.on('message', function (topic, message) {
    console.log('Received message on topic', topic, ':', message.toString());
});

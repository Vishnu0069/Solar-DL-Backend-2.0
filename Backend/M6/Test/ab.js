/*require('dotenv').config();
const { Container } = require('rhea-promise');
const { MongoClient } = require('mongodb');
const fs = require('fs');

async function logToFile(serviceName, operationType, status, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  fs.appendFileSync('M6.log', logMessage);
}

const listenToTopic = async () => {
  const container = new Container();
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.MONGODB_DB_NAME);
    const collection = database.collection(process.env.MONGODB_COLLECTION_NAME);
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
    logToFile("Mon6", "ActiveMQ", "subscribe", 'Subscribed to /response topic and waiting for messages...');

    receiver.on('message', async context => {
      try {
        const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
        logToFile("Mon6", "database", "success", 'Received message:', JSON.stringify(messageBody, null, 2));

        // Extract device make and metadata
        const { deviceMake, metadata, responseData } = messageBody;

        // Check if metadata is defined
        if (metadata) {
          // Destructure metadata properties
          const { PlantID, integratorId, PlantName } = metadata;

          // Your further processing logic here
          // For now, let's just log the extracted metadata
          logToFile("Mon6", "database", "success", `Received message with PlantID: ${PlantID}`);
          
          // Example: Insert the mapped data into MongoDB
          const result = await collection.insertOne({ 
            PlantID,
            integratorId,
            PlantName,
            deviceMake,
            responseData
          });
          
          logToFile("Mon6", "database", "success", `Inserted document with _id: ${result.insertedId}`);
        } else {
          logToFile("Mon6", "database", "error", "Metadata is undefined");
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or listen to topic:', error);
  }
};

listenToTopic().catch(console.error);*/
require('dotenv').config();
const { Container } = require('rhea-promise');
const { MongoClient } = require('mongodb');
const fs = require('fs');

// Function to append logs to a file
async function logToFile(serviceName, operationType, status, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
    fs.appendFileSync('M6.log', logMessage);
}

// Function to listen to the /response topic and process messages
const listenToTopic = async () => {
    const container = new Container();
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        // Connect to MongoDB
        await client.connect();
        const database = client.db(process.env.MONGODB_DB_NAME);
        const collection = database.collection(process.env.MONGODB_COLLECTION_NAME);
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
                address: '/response',
                durable: 2,
                expiry_policy: 'never'
            }
        };

        const receiver = await connection.createReceiver(receiverOptions);
        logToFile("Mon6", "ActiveMQ", "subscribe", 'Subscribed to /response topic and waiting for messages...');

        receiver.on('message', async context => {
            try {
                const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
                logToFile("Mon6", "database", "success", 'Received message:', JSON.stringify(messageBody, null, 2));
                
                const { deviceMake, metadata, responseData } = messageBody;

                switch (deviceMake) {
                    case 'solaredge':

                    const currentUtcDate = new Date();
               const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
               const istDate = new Date(currentUtcDate.getTime() + istOffset);
               const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');
           
                        const {
                            PlantID,
                            modelno,
                            deviceSN,
                            DeviceType,
                            Capacity,
                            Phase,
                            Latitude,
                            Longitude,
                            PlantName,
                            deviceUUID
                        } = metadata;

                        // Extract DC voltage and current fields
                        const DCVoltageTargetFields = responseData.data.telemetries.map(telemetry => telemetry.dcVoltage);
                        const DCCurrentTargetFields = responseData.data.telemetries.map(telemetry => telemetry.dcCurrent);

                        // Combine AC voltage and current telemetry into one object
                        const ACFields = responseData.data.telemetries.map(telemetry => ({
                            ACVoltage: {
                                vACR: telemetry.L1Data.acVoltage,
                                vACS: telemetry.L2Data.acVoltage,
                                vACT: telemetry.L3Data.acVoltage
                            },
                            ACCurrent: {
                                iACR: telemetry.L1Data.acCurrent,
                                iACS: telemetry.L2Data.acCurrent,
                                iACT: telemetry.L3Data.acCurrent
                            }
                        }));

                        // Insert the mapped data into MongoDB
                        const result = await collection.insertOne({
                            DeviceUUIDMap: {
                                deviceUUID,
                                deviceMake,
                                LocalDateTime: currentLocalDateTime,
                                HeaderTarget: {
                                    deviceMake,
                                    PlantID,
                                    deviceUUID,
                                    modelno,
                                    deviceSN,
                                    DeviceType,
                                    Capacity,
                                    Phase,
                                    Latitude,
                                    Longitude,
                                    PlantName,
                                    LocalDate: new Date().toLocaleDateString('en-GB'),
                                    UTCDateTime: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                                },
                                DCVoltageTargetFields,
                                DCCurrentTargetFields,
                                ACVoltageTargetFields: ACFields.map(field => field.ACVoltage),
                                ACCurrentTargetFields: ACFields.map(field => field.ACCurrent),
                                ACPhasenumberTargetFields: Phase,
                                inverterTempTargetFields: responseData.data.telemetries.map(telemetry => telemetry.temperature),
                                inverterTempUnitTargetFields: 'Celcius',
                                WeatherTargetFields: []
                            }
                        });

                        logToFile("Mon6", "database", "success", `Inserted document with _id: ${result.insertedId}`);
                        break;

                    default:
                        logToFile("Mon6", "read", "error", "DeviceMake not recognized. No API call made.");
                        break;
                }
            } catch (err) {
                console.error('Error processing message:', err);
                logToFile("Mon6", "database", "error", `Error processing message: ${err.message}`);
            }
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB or listen to topic:', error);
        logToFile("Mon6", "connect", "error", `Failed to connect or listen to topic: ${error.message}`);
    }
};

listenToTopic().catch(console.error);


// Start of code block

// Import required modules for AMQP messaging, MongoDB operations, and file system interactions
// Written by Vishnu Prasad S
// Written at date: 13-03-2024
require('dotenv').config();
const { Container } = require('rhea-promise');
const { MongoClient } = require('mongodb');
const fs = require('fs');

// Function to append log entries to a file, providing a timestamp and log details
// Logs are critical for monitoring the application's behavior and troubleshooting
// Written by Vishnu Prasad S
// Written at date: 13-03-2024
async function logToFile(serviceName, operationType, status, message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
    fs.appendFileSync('M6.log', logMessage);
}

// Main function to set up a listener on the /response topic and process incoming messages
// Establishes connections to both ActiveMQ and MongoDB, and logs important actions
// Written by Vishnu Prasad S
// Written at date: 13-03-2024
const listenToTopic = async () => {
    const container = new Container();
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        // Connect to MongoDB and log connection status
        // MongoDB is used for storing processed data from messages
        // Written by Vishnu Prasad S
        // Written at date: 13-03-2024        await client.connect();
        const database = client.db(process.env.MONGODB_DB_NAME);
        const collection = database.collection(process.env.MONGODB_COLLECTION_NAME);
        logToFile("Mon6", "database", "success", "Connected to MongoDB.");

        // Connect to ActiveMQ and set up a receiver for the /response topic
        // This section handles message reception and logging of the subscription status
        // Written by Vishnu Prasad S
        // Written at date: 13-03-2024
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

        // Event handler for processing each received message
        // Extracts and processes data from messages, and stores results in MongoDB
        // Written by Vishnu Prasad S
        // Written at date: 13-03-2024
        receiver.on('message', async context => {
            try {
                const messageBody = context.message.body ? JSON.parse(context.message.body.toString()) : {};
                logToFile("Mon6", "database", "success", 'Received message:', JSON.stringify(messageBody, null, 2));

                // Additional processing logic for different device makes, using data to calculate and store results
                // Written by Vishnu Prasad S
                // Written at date: 13-03-2024
                // Please uncomment the necessary blocks for functionality as indicated in the script comments
                const { deviceMake, metadata, responseData } = messageBody;

                switch (deviceMake) {
                    case 'solaredge':

                        const currentUtcDate = new Date();
                        const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
                        const istDate = new Date(currentUtcDate.getTime() + istOffset);
                        const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

                        const {
                            /*PlantID,
                            modelno,
                            deviceSN,
                            DeviceType,
                            Capacity,
                            Phase,
                            Latitude,
                            Longitude,
                            PlantName,
                            deviceUUID*/
                            integratorId,
                            PlantName,
                            PlantSL_NO,
                            PlantID,
                            PlantType,
                            PlantCapacity,
                            PlantSystemType,
                            Latitude,
                            Longitude,
                            Country,
                            Region,
                            State,
                            District,
                            AzimuthalAngle,
                            TiltAngle,
                            DeviceUUID,
                            DeviceMake,
                            ModelNo,
                            DeviceSN,
                            DeviceType,
                            Capacity,
                            CapacityUOM,
                            Phase
                        } = metadata;

                        // Extract DC voltage and current fields
                        const DCVoltageTargetFields = responseData.data.telemetries.map(telemetry => telemetry.dcVoltage);
                        const DCCurrentTargetFields = responseData.data.telemetries.map(telemetry => telemetry.dcCurrent);

                        /*// Combine AC voltage and current telemetry into one object
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
                            },
                            //adding AC power
                            /*ACPower: {
                                pACR: telemetry.L1Data.acVoltage * telemetry.L1Data.acCurrent,
                                pACS: telemetry.L2Data.acVoltage * telemetry.L2Data.acCurrent,
                                pACT: telemetry.L3Data.acVoltage * telemetry.L3Data.acCurrent
                            }*/
                        //})); make sure u uncomment this line for the above block to run 
                        // Calculate average AC voltage and current across all telemetries
                        const numEntries = responseData.data.telemetries.length;
                        const summedACFields = responseData.data.telemetries.reduce((acc, telemetry) => {
                            acc.vACR += telemetry.L1Data.acVoltage;
                            acc.vACS += telemetry.L2Data.acVoltage;
                            acc.vACT += telemetry.L3Data.acVoltage;
                            acc.iACR += telemetry.L1Data.acCurrent;
                            acc.iACS += telemetry.L2Data.acCurrent;
                            acc.iACT += telemetry.L3Data.acCurrent;
                            return acc;
                        }, { vACR: 0, vACS: 0, vACT: 0, iACR: 0, iACS: 0, iACT: 0 });

                        const avgACVoltage = {
                            vACR: summedACFields.vACR / numEntries,
                            vACS: summedACFields.vACS / numEntries,
                            vACT: summedACFields.vACT / numEntries
                        };

                        const avgACCurrent = {
                            iACR: summedACFields.iACR / numEntries,
                            iACS: summedACFields.iACS / numEntries,
                            iACT: summedACFields.iACT / numEntries
                        };




                        // Calculate total power by summing up all power values across all phases and entries
                        const totalPower = responseData.data.telemetries.reduce((total, telemetry) => {
                            const powerPerEntry = telemetry.L1Data.acVoltage * telemetry.L1Data.acCurrent +
                                telemetry.L2Data.acVoltage * telemetry.L2Data.acCurrent +
                                telemetry.L3Data.acVoltage * telemetry.L3Data.acCurrent;
                            return total + powerPerEntry;
                        }, 0);

                        // Insert the mapped data into MongoDB
                        const result = await collection.insertOne({
                            DeviceUUIDMap: {
                                //deviceUUID,
                                //deviceMake,
                                DeviceUUID,
                                DeviceMake,
                                LocalDateTime: currentLocalDateTime,
                                HeaderTarget: {
                                    integratorId,
                                    PlantName,
                                    PlantSL_NO,
                                    PlantID,
                                    PlantType,
                                    PlantCapacity,
                                    PlantSystemType,
                                    Latitude,
                                    Longitude,
                                    Country,
                                    Region,
                                    State,
                                    District,
                                    AzimuthalAngle,
                                    TiltAngle,
                                    DeviceUUID,
                                    DeviceMake,
                                    ModelNo,
                                    DeviceSN,
                                    DeviceType,
                                    Capacity,
                                    CapacityUOM,
                                    LocalDate: new Date().toLocaleDateString('en-GB'),
                                    UTCDateTime: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                                },
                                DCVoltageTargetFields,
                                DCCurrentTargetFields,
                                //ACVoltageTargetFields: ACFields.map(field => field.ACVoltage),
                                //ACCurrentTargetFields: ACFields.map(field => field.ACCurrent),
                                ACVoltageTargetFields: avgACVoltage,
                                ACCurrentTargetFields: avgACCurrent,
                                //adding AC power
                                ACPowerTargetFields: totalPower,
                                ACPowerUOM: "KWH",
                                ACPhasenumberTargetFields: Phase,
                                inverterTempTargetFields: responseData.data.telemetries.map(telemetry => telemetry.temperature),
                                inverterTempUnitTargetFields: 'Celsius',
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
// Start the listener and handle any uncaught exceptions
// Written by Vishnu Prasad S
// Written at date: 13-03-2024
listenToTopic().catch(console.error);
// End of code block

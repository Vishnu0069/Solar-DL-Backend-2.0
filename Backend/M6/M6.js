require('dotenv').config();
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
    
        /*// Assuming the DeviceUUID is in the metadata
        const deviceUUID = metadata ? metadata.deviceUUID : 'unknown';
    
        // Map AC voltages and currents based on device make
        let StringVoltageTargetFields = [];
        let StringCurrentTargetFields = [];
        let ACPhasenumberTargetFields = '';
        let inverterTempTargetFields = [];
        let inverterTempUnitTargetFields = 'Celcius'; // Assuming temperature unit is always Celsius
        let WeatherTargetFields = [];
    
        switch (deviceMake) {
          case 'solaredge':
            // Extract metadata fields
            const { PlantID, modelno, deviceSN, DeviceType, Capacity, Phase, Latitude, Longitude, PlantName} = metadata;
    
            // Extract DC voltage and current fields
            StringVoltageTargetFields = responseData.data.telemetries.map(telemetry => telemetry.dcVoltage);
            StringCurrentTargetFields = responseData.data.telemetries.map(telemetry => telemetry.dcCurrent);
    
            // Extract AC voltage and current fields
            const ACVoltageTargetFields = responseData.data.telemetries.map(telemetry => telemetry.L1Data.acVoltage + telemetry.L2Data.acVoltage + telemetry.L3Data.acVoltage);
            const ACCurrentTargetFields = responseData.data.telemetries.map(telemetry => telemetry.L1Data.acCurrent + telemetry.L2Data.acCurrent + telemetry.L3Data.acCurrent);
    
            // Extract other fields
            ACPhasenumberTargetFields = Phase;
            inverterTempTargetFields = responseData.data.telemetries.map(telemetry => telemetry.temperature);
    
            // Insert the mapped data into MongoDB
            const result = await collection.insertOne({ 
              DeviceUUIDMap: {
                deviceUUID,
                deviceMake,
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
                  LocalDate: new Date().toLocaleDateString('en-GB'), // Local date in yyyy/mm/dd format
                  UTCDateTime: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') // UTC date and time in yyyy/mm/dd HH/MM/SS format
                },
                StringVoltageTargetFields,
                StringCurrentTargetFields,
                ACVoltageTargetFields,
                ACCurrentTargetFields,
                ACPhasenumberTargetFields,
                inverterTempTargetFields,
                inverterTempUnitTargetFields,
                WeatherTargetFields
              }
            });
            */
           // Assuming the DeviceUUID is in the metadata
           const deviceUUID = metadata ? metadata.deviceUUID : 'unknown';

           // Map AC voltages and currents based on device make
           let ACVoltageTargetFields = [];
           let ACCurrentTargetFields = [];
           let ACPhasenumberTargetFields = '';
           let inverterTempTargetFields = [];
           let inverterTempUnitTargetFields = 'Celcius'; // Assuming temperature unit is always Celsius
           let WeatherTargetFields = [];
           // Calculate current LocalDateTime in IST (UTC+5:30)
    //const currentUtcDate = new Date();
    //const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    //const istDate = new Date(currentUtcDate.getTime() + istOffset);
    //const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');

    

           switch (deviceMake) {
             case 'solaredge':
               // Extract metadata fields
               const { PlantID, modelno, deviceSN, DeviceType, Capacity, Phase, Latitude, Longitude, PlantName } = metadata;
           
               // Extract DC voltage and current fields
               const DCVoltageTargetFields = responseData.data.telemetries.map(telemetry => telemetry.dcVoltage);
               const DCCurrentTargetFields = responseData.data.telemetries.map(telemetry => telemetry.dcCurrent);
               const currentUtcDate = new Date();
               const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
               const istDate = new Date(currentUtcDate.getTime() + istOffset);
               const currentLocalDateTime = istDate.toISOString().replace('T', ' ').substring(0, 16).replace(':', '-');
           
               
           
               // Extract AC voltage and current fields
               const ACVoltageTelemetry = responseData.data.telemetries.map(telemetry => ({
                 vACR: telemetry.L1Data.acVoltage,
                 vACS: telemetry.L2Data.acVoltage,
                 vACT: telemetry.L3Data.acVoltage
               }));
               const ACCurrentTelemetry = responseData.data.telemetries.map(telemetry => ({
                 iACR: telemetry.L1Data.acCurrent,
                 iACS: telemetry.L2Data.acCurrent,
                 iACT: telemetry.L3Data.acCurrent
               }));
           
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
           
               // Extract other fields
               ACPhasenumberTargetFields = Phase;
               inverterTempTargetFields = responseData.data.telemetries.map(telemetry => telemetry.temperature);
               
              const result = await collection.insertOne({
                DeviceUUIDMap: {
                  deviceUUID,
                  deviceMake,
                  LocalDateTime:currentLocalDateTime,
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
                    LocalDate: new Date().toLocaleDateString('en-GB'), // Local date in yyyy/mm/dd format
                    UTCDateTime: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') // UTC date and time in yyyy/mm/dd HH/MM/SS format
                  },
                  DCVoltageTargetFields,
                  DCCurrentTargetFields,
                  ACVoltageTargetFields: ACFields.map(field => field.ACVoltage),
                  ACCurrentTargetFields: ACFields.map(field => field.ACCurrent),
                  ACPhasenumberTargetFields,
                  inverterTempTargetFields,
                  inverterTempUnitTargetFields,
                  WeatherTargetFields
                }
              });




    
            logToFile("Mon6", "database", "success", `Inserted document with _id: ${result.insertedId}`,currentLocalDateTime);
            break;
    
          case 'solis':
            // Handle mapping for Solis devices if needed
            break;
    
          default:
            break;
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB or listen to topic:', error);
  }
};

listenToTopic().catch(console.error);

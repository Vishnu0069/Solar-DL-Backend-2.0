// Load environment variables from .env file
require("dotenv").config();
const { Container } = require("rhea-promise");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Logging function to capture logs with timestamps
async function logToFile(
  serviceName,
  logLevel,
  operationType,
  status,
  message
) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

  const logDirectory = path.join(__dirname, "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  const logFilePath = path.join(logDirectory, "M4.log");
  fs.appendFileSync(logFilePath, logMessage);
}

// Main function to set up a listener for the /response topic
const listenToTopic = async () => {
  const container = new Container();
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db(process.env.MONGODB_DB_NAME);
    const collection = database.collection(process.env.MONGODB_COLLECTION_NAME);
    logToFile("Mon4", "L2", "database", "success", "Connected to MongoDB.");

    // Connect to ActiveMQ and set up a receiver for the /response topic
    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: "tcp", // or 'ssl' for secure connections
    });

    const receiverOptions = {
      source: {
        address: "/response",
        durable: 2,
        expiry_policy: "never",
      },
    };

    const receiver = await connection.createReceiver(receiverOptions);
    logToFile(
      "Mon4",
      "L2",
      "ActiveMQ",
      "subscribe",
      "Subscribed to /response topic and waiting for messages..."
    );

    // Process each received message
    receiver.on("message", async (context) => {
      try {
        const messageBody = context.message.body
          ? JSON.parse(context.message.body.toString())
          : {};
        logToFile(
          "Mon4",
          "L2",
          "read",
          "success",
          `Received message: ${JSON.stringify(messageBody, null, 2)}`
        );

        // Extract relevant data from the message body
        const { deviceMake, metadata, responseData } = messageBody;

        // Process data based on the deviceMake
        switch (deviceMake.toLowerCase()) {
          case "solaredge":
            const currentUtcDate = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
            const istDate = new Date(currentUtcDate.getTime() + istOffset);
            const currentLocalDateTime = istDate
              .toISOString()
              .replace("T", " ")
              .substring(0, 16)
              .replace(":", "-");

            // Extract telemetry fields
            const DCVoltageTargetFields = responseData.data.telemetries.map(
              (telemetry) => telemetry.dcVoltage
            );
            const DCCurrentTargetFields = responseData.data.telemetries.map(
              (telemetry) => telemetry.dcCurrent
            );

            const numEntries = responseData.data.telemetries.length;
            const summedACFields = responseData.data.telemetries.reduce(
              (acc, telemetry) => {
                acc.vACR += telemetry.L1Data.acVoltage;
                acc.vACS += telemetry.L2Data.acVoltage;
                acc.vACT += telemetry.L3Data.acVoltage;
                acc.iACR += telemetry.L1Data.acCurrent;
                acc.iACS += telemetry.L2Data.acCurrent;
                acc.iACT += telemetry.L3Data.acCurrent;
                return acc;
              },
              { vACR: 0, vACS: 0, vACT: 0, iACR: 0, iACS: 0, iACT: 0 }
            );

            const avgACVoltage = {
              vACR: summedACFields.vACR / numEntries,
              vACS: summedACFields.vACS / numEntries,
              vACT: summedACFields.vACT / numEntries,
            };

            const avgACCurrent = {
              iACR: summedACFields.iACR / numEntries,
              iACS: summedACFields.iACS / numEntries,
              iACT: summedACFields.iACT / numEntries,
            };

            const totalPower = responseData.data.telemetries.reduce(
              (total, telemetry) => {
                const powerPerEntry =
                  telemetry.L1Data.acVoltage * telemetry.L1Data.acCurrent +
                  telemetry.L2Data.acVoltage * telemetry.L2Data.acCurrent +
                  telemetry.L3Data.acVoltage * telemetry.L3Data.acCurrent;
                return total + powerPerEntry;
              },
              0
            );

            const gridStatus =
              totalPower !== null && !isNaN(totalPower) && totalPower !== 0
                ? "Online"
                : "Offline";

            const result = await collection.insertOne({
              DeviceUUIDMap: {
                DeviceUUID: metadata.DeviceUUID,
                DeviceMake: metadata.DeviceMake,
                LocalDateTime: currentLocalDateTime,
                HeaderTarget: {
                  ...metadata,
                  GridStatus: gridStatus,
                  LocalDate: new Date().toLocaleDateString("en-GB"),
                  UTCDateTime: new Date()
                    .toISOString()
                    .replace(/T/, " ")
                    .replace(/\..+/, ""),
                },
                DCVoltageTargetFields,
                DCCurrentTargetFields,
                ACVoltageTargetFields: avgACVoltage,
                ACCurrentTargetFields: avgACCurrent,
                ACPowerTargetFields: totalPower,
                ACPowerUOM: "KWH",
                ACPhasenumberTargetFields: metadata.Phase,
                inverterTempTargetFields: responseData.data.telemetries.map(
                  (telemetry) => telemetry.temperature
                ),
                inverterTempUnitTargetFields: "Celsius",
                WeatherTargetFields: [],
              },
            });

            logToFile(
              "Mon4",
              "L2",
              "database",
              "success",
              `Inserted document with _id: ${result.insertedId}`
            );
            break;

          default:
            logToFile(
              "Mon4",
              "L2",
              "read",
              "error",
              `Unrecognized deviceMake: ${deviceMake}`
            );
            break;
        }
      } catch (err) {
        logToFile(
          "Mon4",
          "L2",
          "database",
          "error",
          `Error processing message: ${err.message}`
        );
      }
    });
  } catch (error) {
    logToFile(
      "Mon4",
      "L2",
      "connect",
      "error",
      `Failed to connect or listen to topic: ${error.message}`
    );
  }
};

// Start the listener
logToFile("Mon4", "L1", "M4 Service", "success", "Started Successfully...");
listenToTopic().catch(console.error);

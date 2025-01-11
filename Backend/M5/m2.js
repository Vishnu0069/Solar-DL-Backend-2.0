// Load environment variables from .env file
require("dotenv").config();
const { MongoClient } = require("mongodb");
const { Container } = require("rhea-promise");
const path = require("path");
const fs = require("fs");

// Log function
function logToFile(serviceName, logLevel, operationType, status, message) {
  const logDirectory = path.join(__dirname, "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory); // Ensure the logs directory exists
  }
  const logFilePath = path.join(logDirectory, "m2.log");
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${logLevel} - ${serviceName} - ${operationType} - ${status} - ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
}

// Setup MongoDB connection
const mongoClient = new MongoClient(process.env.MONGO_URI);
let deviceCollection;

// Initialize MongoDB
async function initializeMongoDB() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGO_DB_NAME);
    deviceCollection = db.collection(process.env.MONGO_COLLECTION_NAME);
    logToFile("M2", "L1", "MongoDB", "SUCCESS", "Connected to MongoDB.");
  } catch (error) {
    logToFile("M2", "L1", "MongoDB", "FAILED", `Error: ${error.message}`);
    process.exit(1);
  }
}

// Send message to queue
async function sendMessageToQueue(queueName, messageData) {
  const container = new Container();
  try {
    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: "tcp",
    });
    const sender = await connection.createSender(queueName);
    await sender.send({ body: JSON.stringify(messageData) });
    logToFile(
      "M2",
      "L1",
      "Queue",
      "SUCCESS",
      `Message sent to ${queueName}: ${JSON.stringify(messageData)}`
    );
    await sender.close();
    await connection.close();
  } catch (error) {
    logToFile(
      "M2",
      "L2",
      "Queue",
      "FAILED",
      `Error sending message to queue: ${error.message}`
    );
  }
}

async function processRecords() {
  try {
    const cursor = deviceCollection.find({});
    while (await cursor.hasNext()) {
      const record = await cursor.next();

      // Unified deviceMake handling
      const deviceMake = record.deviceMake || record.DeviceMake || record.make;

      // Check for missing or unsupported deviceMake
      if (!deviceMake) {
        logToFile(
          "M2",
          "L2",
          "Process",
          "SKIP",
          `Record skipped due to missing deviceMake. Fields: ${JSON.stringify(
            Object.keys(record)
          )}`
        );
        continue;
      }

      const { url, apiKey, serialNumber, plantId } = record;

      // Skip if required fields are missing
      if (!url || !apiKey) {
        logToFile(
          "M2",
          "L2",
          "Process",
          "SKIP",
          `Record skipped due to missing URL or API Key. Record: ${JSON.stringify(
            record
          )}`
        );
        continue;
      }

      let constructedUrls = [];
      let messageData = {};

      switch (deviceMake.toLowerCase()) {
        case "solaredge":
          const serialNumbers = serialNumber
            ? serialNumber.split(",").map((sn) => sn.trim())
            : [];
          serialNumbers.forEach((sn) => {
            if (url && apiKey) {
              constructedUrls.push(`${url}/${sn}/data?api_key=${apiKey}`);
            }
          });

          messageData = {
            plantId,
            deviceMake,
            constructedUrls,
            metadata: record.metadata || {},
          };
          break;

        case "solarman":
          messageData = {
            plantId,
            deviceMake,
            metadata: record.metadata || {},
          };
          break;

        default:
          logToFile(
            "M2",
            "L2",
            "Process",
            "SKIP",
            `Unsupported deviceMake: ${deviceMake}`
          );
          continue;
      }

      // Send message to queue
      await sendMessageToQueue("/process", messageData);
      logToFile(
        "M2",
        "L2",
        "Process",
        "SUCCESS",
        `Processed record for plant: ${plantId}, make: ${deviceMake}`
      );
    }
  } catch (error) {
    logToFile("M2", "L0", "Process", "FAILED", `Error: ${error.message}`);
  }
}

// Main function
(async () => {
  await initializeMongoDB();
  await processRecords();
})();

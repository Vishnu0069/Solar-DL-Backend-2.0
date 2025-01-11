// Load environment variables from .env file
require("dotenv").config();
const mysql = require("mysql");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// Setup MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Setup MongoDB connection
const mongoClient = new MongoClient(process.env.MONGO_URI);
let deviceCollection;

// Log function with L0, L1, L2 levels
function logToFile(serviceName, logLevel, operationType, status, message) {
  const logDirectory = path.join(__dirname, "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory); // Ensure the logs directory exists
  }
  const logFilePath = path.join(logDirectory, "MON-1.log");
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${logLevel} - ${serviceName} - ${operationType} - ${status} - ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
}

// Initialize MongoDB
async function initializeMongoDB() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(process.env.MONGO_DB_NAME);
    deviceCollection = db.collection(process.env.MONGO_COLLECTION_NAME);
    logToFile("MON-1", "L1", "MongoDB", "SUCCESS", "Connected to MongoDB.");
  } catch (error) {
    logToFile("MON-1", "L1", "MongoDB", "FAILED", `Error: ${error.message}`);
    process.exit(1);
  }
}

// Fetch and process new device data
async function fetchAndProcessDevices() {
  try {
    db.connect((err) => {
      if (err) {
        logToFile("MON-1", "L1", "MySQL", "FAILED", `Error: ${err.message}`);
        return;
      }
      logToFile("MON-1", "L1", "MySQL", "SUCCESS", "Connected to MySQL.");
    });

    const deviceQuery = `
      SELECT dm.Serial_Nos, dm.Plant_id, dm.make, dm.model, dm.System_date_time,
             ps.url, ps.user_name, ps.api_key, ps.password
      FROM gsai_device_master dm
      LEFT JOIN gsai_plant_api_settings ps ON dm.Plant_id = ps.plant_id
      WHERE dm.System_date_time > ?;
    `;

    const lastProcessedTime = new Date(0);

    db.query(deviceQuery, [lastProcessedTime], async (err, results) => {
      if (err) {
        logToFile("MON-1", "L1", "MySQL", "FAILED", `Error: ${err.message}`);
        return;
      }

      logToFile(
        "MON-1",
        "L0",
        "Fetch",
        "SUCCESS",
        "Fetched devices from MySQL."
      );
      for (const device of results) {
        const document = {
          serialNumber: device.Serial_Nos,
          plantId: device.Plant_id,
          make: device.make,
          model: device.model,
          systemDateTime: device.System_date_time,
          url: device.url || "N/A",
          userName: device.user_name || "N/A",
          apiKey: device.api_key || "N/A",
          password: device.password || "N/A",
        };

        logToFile(
          "MON-1",
          "L2",
          "Process",
          "SUCCESS",
          `Processed device: ${JSON.stringify(document)}`
        );

        try {
          await deviceCollection.insertOne(document);
          logToFile(
            "MON-1",
            "L1",
            "MongoDB",
            "SUCCESS",
            `Inserted device into MongoDB: ${JSON.stringify(document)}`
          );
        } catch (mongoErr) {
          logToFile(
            "MON-1",
            "L2",
            "MongoDB",
            "FAILED",
            `Error inserting device: ${mongoErr.message}`
          );
        }

        if (new Date(device.System_date_time) > lastProcessedTime) {
          lastProcessedTime.setTime(
            new Date(device.System_date_time).getTime()
          );
        }
      }
    });
  } catch (error) {
    logToFile("MON-1", "L1", "Fetch", "FAILED", `Error: ${error.message}`);
  } finally {
    db.end((err) => {
      if (err) {
        logToFile("MON-1", "L1", "MySQL", "FAILED", `Error: ${err.message}`);
      } else {
        logToFile(
          "MON-1",
          "L1",
          "MySQL",
          "SUCCESS",
          "MySQL connection closed."
        );
      }
    });
  }
}

// Main function to initialize and run the process
(async () => {
  await initializeMongoDB();
  await fetchAndProcessDevices();
})();

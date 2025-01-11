// Load environment variables from .env file
require("dotenv").config();
const mysql = require("mysql");
const fs = require("fs");
const path = require("path");

// Setup MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Log function
function logToFile(message) {
  const logDirectory = path.join(__dirname, "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory); // Ensure the logs directory exists
  }
  const logFilePath = path.join(logDirectory, "MON-1.log");
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
}

// Function to fetch and log device data
async function fetchAndLogDevices() {
  try {
    // Connect to MySQL
    db.connect((err) => {
      if (err) {
        console.error("Error connecting to MySQL:", err);
        logToFile(`Error connecting to MySQL: ${err.message}`);
        return;
      }
      console.log("Connected to MySQL.");
      logToFile("Connected to MySQL.");
    });

    // Query devices from `gsai_device_master`
    const deviceQuery = `
      SELECT dm.Serial_Nos, dm.Plant_id, dm.make, dm.model, dm.System_date_time,
             ps.user_name, ps.api_key
      FROM gsai_device_master dm
      LEFT JOIN gsai_plant_api_settings ps ON dm.Plant_id = ps.plant_id;
    `;

    db.query(deviceQuery, (err, results) => {
      if (err) {
        console.error("Error fetching devices:", err);
        logToFile(`Error fetching devices: ${err.message}`);
        return;
      }

      console.log("Fetched Devices:");
      results.forEach((device) => {
        const logMessage = `
          Device Serial No: ${device.Serial_Nos}
          Plant ID: ${device.Plant_id}
          Make: ${device.make}
          Model: ${device.model}
          User Name: ${device.user_name || "N/A"}
          API Key: ${device.api_key || "N/A"}
          System Date Time: ${device.System_date_time}
        `;
        console.log(logMessage);
        logToFile(logMessage);
      });
    });
  } catch (error) {
    console.error("Error in fetchAndLogDevices:", error);
    logToFile(`Error in fetchAndLogDevices: ${error.message}`);
  } finally {
    // Close MySQL connection
    db.end((err) => {
      if (err) {
        console.error("Error closing MySQL connection:", err);
        logToFile(`Error closing MySQL connection: ${err.message}`);
      } else {
        console.log("MySQL connection closed.");
        logToFile("MySQL connection closed.");
      }
    });
  }
}

// Run the function
fetchAndLogDevices();

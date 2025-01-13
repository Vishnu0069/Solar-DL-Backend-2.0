// // Load environment variables from .env file
// require("dotenv").config();
// const mysql = require("mysql");
// const { MongoClient } = require("mongodb");
// const cron = require("node-cron");
// const path = require("path");
// const fs = require("fs");

// // Logging function
// function logToFile(serviceName, logLevel, operationType, status, message) {
//   const now = new Date();
//   const timestamp = now.toISOString();
//   const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

//   const logDirectory = path.join(__dirname, "logs");
//   if (!fs.existsSync(logDirectory)) {
//     fs.mkdirSync(logDirectory); // Ensure the logs directory exists
//   }

//   const logFilePath = path.join(logDirectory, "Mon1.log");
//   fs.appendFileSync(logFilePath, logMessage, (err) => {
//     if (err) console.error("Failed to write to log file:", err);
//   });
// }

// // Setup MongoDB connection
// const mongoClient = new MongoClient(process.env.MONGO_URI);
// let deviceCollection;

// // Variable to store the maximum `create_date`
// let maxCreateTime = null;

// // Function to connect to MongoDB
// async function connectMongoDB() {
//   try {
//     await mongoClient.connect();
//     logToFile("Mon1", "L1", "Database", "SUCCESS", "Connected to MongoDB.");
//     const db = mongoClient.db(process.env.MONGO_DB_NAME);
//     deviceCollection = db.collection(process.env.MONGO_COLLECTION_NAME);
//   } catch (error) {
//     logToFile(
//       "Mon1",
//       "L2",
//       "Database",
//       "FAILED",
//       `MongoDB connection error: ${error.message}`
//     );
//     process.exit(1);
//   }
// }

// // Setup MySQL connection
// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

// db.connect((err) => {
//   if (err) {
//     logToFile(
//       "Mon1",
//       "L2",
//       "Database",
//       "FAILED",
//       `Error connecting to MySQL: ${err.stack}`
//     );
//     return;
//   }
//   logToFile("Mon1", "L1", "Database", "SUCCESS", "Connected to MySQL.");
// });

// // MySQL query helper
// function query(sql, params) {
//   return new Promise((resolve, reject) => {
//     db.query(sql, params, (err, results) => {
//       if (err) return reject(err);
//       resolve(results);
//     });
//   });
// }

// // Function to fetch all records initially and set maxCreateTime
// async function initializeAndInsertData() {
//   try {
//     const plantQuery = `SELECT * FROM Gsai_PlantMaster;`;
//     const deviceQuery = `SELECT * FROM gsai_device_master;`;
//     const apiSettingsQuery = `SELECT * FROM gsai_plant_api_settings;`;

//     const plants = await query(plantQuery);
//     const devices = await query(deviceQuery);
//     const apiSettings = await query(apiSettingsQuery);

//     if (devices.length === 0) {
//       logToFile("Mon1", "L1", "Initialize", "INFO", "No records found.");
//       return;
//     }

//     for (const device of devices) {
//       const plant = plants.find((p) => p.plant_id === device.Plant_id);
//       const apiSetting = apiSettings.find(
//         (a) => a.Plant_id === device.Plant_id
//       );

//       const document = {
//         device_id: device.device_id,
//         master_device_id: device.master_device_id,
//         device_type_id: device.device_type_id,
//         metadata_id: device.metadata_id,
//         make: device.make,
//         model: device.model,
//         plant_id: device.Plant_id,
//         serial_number: device.Serial_Nos,
//         system_date_time: device.System_date_time,
//         plant_name: plant?.plant_name || null,
//         latitude: plant?.latitude || null,
//         longitude: plant?.longitude || null,
//         plant_category: plant?.plant_category || null,
//         capacity: plant?.capacity || null,
//         capacity_unit: plant?.capacity_unit || null,
//         country: plant?.country || null,
//         region: plant?.region || null,
//         state: plant?.state || null,
//         district: plant?.district || null,
//         category: plant?.plant_category || null,
//         type: plant?.plant_type || null,
//         api_url: apiSetting?.url || null,
//         api_key: apiSetting?.api_key || null,
//         api_token: apiSetting?.token || null,
//         username: apiSetting?.user_name || null,
//         password: apiSetting?.password || null,
//         headers: apiSetting?.header || null,
//       };

//       // Insert the constructed document into MongoDB
//       try {
//         await deviceCollection.insertOne(document);
//         logToFile(
//           "Mon1",
//           "L2",
//           "InsertData",
//           "SUCCESS",
//           `Document inserted into MongoDB: ${JSON.stringify(document)}`
//         );
//       } catch (insertError) {
//         logToFile(
//           "Mon1",
//           "L2",
//           "InsertData",
//           "FAILED",
//           `Error inserting document into MongoDB: ${insertError.message}`
//         );
//       }
//     }

//     // Update maxCreateTime
//     maxCreateTime = Math.max(
//       ...devices.map((device) => new Date(device.create_date).getTime())
//     );
//     logToFile(
//       "Mon1",
//       "L1",
//       "Initialize",
//       "SUCCESS",
//       `Max create_date initialized to: ${new Date(maxCreateTime).toISOString()}`
//     );
//   } catch (error) {
//     logToFile(
//       "Mon1",
//       "L2",
//       "Initialize",
//       "FAILED",
//       `Error during initialization: ${error.message}`
//     );
//   }
// }

// // Function to fetch new records based on maxCreateTime
// async function fetchAndInsertData() {
//   try {
//     if (!maxCreateTime) {
//       logToFile(
//         "Mon1",
//         "L1",
//         "FetchInsert",
//         "INFO",
//         "Max create_date not set. Skipping fetch."
//       );
//       return;
//     }

//     const deviceQuery = `
//       SELECT * FROM gsai_device_master
//       WHERE create_date > ?;
//     `;

//     const devices = await query(deviceQuery, [new Date(maxCreateTime)]);

//     if (devices.length === 0) {
//       logToFile("Mon1", "L1", "FetchInsert", "INFO", "No new records found.");
//       return;
//     }

//     for (const device of devices) {
//       const document = {
//         device_id: device.device_id,
//         master_device_id: device.master_device_id,
//         device_type_id: device.device_type_id,
//         metadata_id: device.metadata_id,
//         make: device.make,
//         model: device.model,
//         plant_id: device.Plant_id,
//         serial_number: device.Serial_Nos,
//         system_date_time: device.System_date_time,
//         create_date: device.create_date,
//       };

//       // Insert the constructed document into MongoDB
//       try {
//         await deviceCollection.insertOne(document);
//         logToFile(
//           "Mon1",
//           "L2",
//           "InsertData",
//           "SUCCESS",
//           `Document inserted into MongoDB: ${JSON.stringify(document)}`
//         );
//       } catch (insertError) {
//         logToFile(
//           "Mon1",
//           "L2",
//           "InsertData",
//           "FAILED",
//           `Error inserting document into MongoDB: ${insertError.message}`
//         );
//       }
//     }

//     // Update maxCreateTime
//     maxCreateTime = Math.max(
//       ...devices.map((device) => new Date(device.create_date).getTime())
//     );
//     logToFile(
//       "Mon1",
//       "L1",
//       "FetchInsert",
//       "SUCCESS",
//       `Max create_date updated to: ${new Date(maxCreateTime).toISOString()}`
//     );
//   } catch (error) {
//     logToFile(
//       "Mon1",
//       "L2",
//       "FetchInsert",
//       "FAILED",
//       `Error during fetch and insert: ${error.message}`
//     );
//   }
// }

// // Schedule the function to run every 15 minutes
// const interval = process.env.T_INTERVAL || 15; // Default to 15 minutes
// const cronInterval = `*/${interval} * * * *`;

// cron.schedule(cronInterval, async () => {
//   logToFile(
//     "Mon1",
//     "L1",
//     "Scheduler",
//     "INFO",
//     "Starting fetch and insert operation."
//   );
//   await fetchAndInsertData();
// });

// // Initialize and start the process
// (async () => {
//   await connectMongoDB();
//   await initializeAndInsertData(); // Initial run
// })();

// Load environment variables from .env file
// Load environment variables from .env file
require("dotenv").config();
const mysql = require("mysql");
const { MongoClient } = require("mongodb");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

// Logging function
function logToFile(serviceName, logLevel, operationType, status, message) {
  const now = new Date();
  const timestamp = now.toISOString();
  const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

  const logDirectory = path.join(__dirname, "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory); // Ensure the logs directory exists
  }

  const logFilePath = path.join(logDirectory, "Mon1.log");
  fs.appendFileSync(logFilePath, logMessage, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
}

// Setup MongoDB connection
const mongoClient = new MongoClient(process.env.MONGO_URI);
let deviceCollection;

// Function to connect to MongoDB
async function connectMongoDB() {
  try {
    await mongoClient.connect();
    logToFile("Mon1", "L1", "Database", "SUCCESS", "Connected to MongoDB.");
    const db = mongoClient.db(process.env.MONGO_DB_NAME);
    deviceCollection = db.collection(process.env.MONGO_COLLECTION_NAME);
  } catch (error) {
    logToFile(
      "Mon1",
      "L2",
      "Database",
      "FAILED",
      `MongoDB connection error: ${error.message}`
    );
    process.exit(1);
  }
}

// Function to dynamically connect to MySQL
function connectMySQL() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
}

// Function to query MySQL with a dynamic connection
function queryWithDynamicConnection(sql, params) {
  return new Promise((resolve, reject) => {
    const dynamicDb = connectMySQL();
    dynamicDb.connect((err) => {
      if (err) {
        logToFile(
          "Mon1",
          "L2",
          "Database",
          "FAILED",
          `Error connecting to MySQL: ${err.stack}`
        );
        dynamicDb.end();
        return reject(err);
      }
    });

    dynamicDb.query(sql, params, (err, results) => {
      if (err) {
        dynamicDb.end();
        return reject(err);
      }
      dynamicDb.end();
      resolve(results);
    });
  });
}

// Function to run m2.js
function runM2Script() {
  exec("node m2.js", (error, stdout, stderr) => {
    if (error) {
      logToFile(
        "Mon1",
        "L2",
        "RunM2",
        "FAILED",
        `Error running m2.js: ${error.message}`
      );
      return;
    }
    if (stderr) {
      logToFile("Mon1", "L2", "RunM2", "WARNING", `m2.js stderr: ${stderr}`);
    }
    logToFile("Mon1", "L1", "RunM2", "SUCCESS", `m2.js stdout: ${stdout}`);
  });
}

// Variable to store the maximum `create_date`
let maxCreateTime = null;

// Function to fetch all records initially and set maxCreateTime
async function initializeAndInsertData() {
  try {
    const plantQuery = `SELECT * FROM Gsai_PlantMaster;`;
    const deviceQuery = `SELECT * FROM gsai_device_master;`;
    const apiSettingsQuery = `SELECT * FROM gsai_plant_api_settings;`;

    const plants = await queryWithDynamicConnection(plantQuery);
    const devices = await queryWithDynamicConnection(deviceQuery);
    const apiSettings = await queryWithDynamicConnection(apiSettingsQuery);

    if (devices.length === 0) {
      logToFile("Mon1", "L1", "Initialize", "INFO", "No records found.");
    } else {
      for (const device of devices) {
        const plant = plants.find((p) => p.plant_id === device.Plant_id);
        const apiSetting = apiSettings.find(
          (a) => a.Plant_id === device.Plant_id
        );

        const document = {
          device_id: device.device_id,
          master_device_id: device.master_device_id,
          device_type_id: device.device_type_id,
          metadata_id: device.metadata_id,
          make: device.make,
          model: device.model,
          plant_id: device.Plant_id,
          serial_number: device.Serial_Nos,
          system_date_time: device.System_date_time,
          plant_name: plant?.plant_name || null,
          latitude: plant?.latitude || null,
          longitude: plant?.longitude || null,
          plant_category: plant?.plant_category || null,
          capacity: plant?.capacity || null,
          capacity_unit: plant?.capacity_unit || null,
          country: plant?.country || null,
          region: plant?.region || null,
          state: plant?.state || null,
          district: plant?.district || null,
          category: plant?.plant_category || null,
          type: plant?.plant_type || null,
          api_url: apiSetting?.url || null,
          api_key: apiSetting?.api_key || null,
          api_token: apiSetting?.token || null,
          username: apiSetting?.user_name || null,
          password: apiSetting?.password || null,
          headers: apiSetting?.header || null,
        };

        // Insert the constructed document into MongoDB
        try {
          await deviceCollection.insertOne(document);
          logToFile(
            "Mon1",
            "L2",
            "InsertData",
            "SUCCESS",
            `Document inserted into MongoDB: ${JSON.stringify(document)}`
          );
        } catch (insertError) {
          logToFile(
            "Mon1",
            "L2",
            "InsertData",
            "FAILED",
            `Error inserting document into MongoDB: ${insertError.message}`
          );
        }
      }

      // Update maxCreateTime
      maxCreateTime = Math.max(
        ...devices.map((device) => new Date(device.create_date).getTime())
      );
      logToFile(
        "Mon1",
        "L1",
        "Initialize",
        "SUCCESS",
        `Max create_date initialized to: ${new Date(
          maxCreateTime
        ).toISOString()}`
      );
    }

    // Run m2.js after initial data insertion (mandatory)
    runM2Script();
  } catch (error) {
    logToFile(
      "Mon1",
      "L2",
      "Initialize",
      "FAILED",
      `Error during initialization: ${error.message}`
    );
    // Run m2.js even in case of errors
    runM2Script();
  }
}

// Function to fetch new records based on maxCreateTime
async function fetchAndInsertData() {
  try {
    const deviceQuery = `
      SELECT * FROM gsai_device_master
      WHERE create_date > ?;
    `;

    const devices = await queryWithDynamicConnection(deviceQuery, [
      new Date(maxCreateTime),
    ]);

    if (devices.length === 0) {
      logToFile("Mon1", "L1", "FetchInsert", "INFO", "No new records found.");
    } else {
      for (const device of devices) {
        const document = {
          device_id: device.device_id,
          master_device_id: device.master_device_id,
          device_type_id: device.device_type_id,
          metadata_id: device.metadata_id,
          make: device.make,
          model: device.model,
          plant_id: device.Plant_id,
          serial_number: device.Serial_Nos,
          system_date_time: device.System_date_time,
          create_date: device.create_date,
        };

        // Insert the constructed document into MongoDB
        try {
          await deviceCollection.insertOne(document);
          logToFile(
            "Mon1",
            "L2",
            "InsertData",
            "SUCCESS",
            `Document inserted into MongoDB: ${JSON.stringify(document)}`
          );
        } catch (insertError) {
          logToFile(
            "Mon1",
            "L2",
            "InsertData",
            "FAILED",
            `Error inserting document into MongoDB: ${insertError.message}`
          );
        }
      }

      // Update maxCreateTime
      maxCreateTime = Math.max(
        ...devices.map((device) => new Date(device.create_date).getTime())
      );
      logToFile(
        "Mon1",
        "L1",
        "FetchInsert",
        "SUCCESS",
        `Max create_date updated to: ${new Date(maxCreateTime).toISOString()}`
      );
    }

    // Run m2.js after fetching and inserting data
    runM2Script();
  } catch (error) {
    logToFile(
      "Mon1",
      "L2",
      "FetchInsert",
      "FAILED",
      `Error during fetch and insert: ${error.message}`
    );
    // Run m2.js even in case of errors
    runM2Script();
  }
}

// Schedule the function to run every 15 minutes
const interval = process.env.T_INTERVAL || 15; // Default to 15 minutes
const cronInterval = `*/${interval} * * * *`;

cron.schedule(cronInterval, async () => {
  logToFile(
    "Mon1",
    "L1",
    "Scheduler",
    "INFO",
    "Starting fetch and insert operation."
  );
  await fetchAndInsertData();
});

// Initialize and start the process
(async () => {
  await connectMongoDB();
  await initializeAndInsertData(); // Initial run
})();

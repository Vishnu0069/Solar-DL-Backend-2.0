// // // Load environment variables from .env file
// // require("dotenv").config();
// // const mysql = require("mysql");
// // const fs = require("fs");
// // const path = require("path");
// // const { MongoClient } = require("mongodb");

// // // Setup MySQL connection
// // const db = mysql.createConnection({
// //   host: process.env.DB_HOST,
// //   user: process.env.DB_USER,
// //   password: process.env.DB_PASSWORD,
// //   database: process.env.DB_DATABASE,
// // });

// // // Setup MongoDB connection
// // const mongoClient = new MongoClient(process.env.MONGO_URI);
// // let deviceCollection;

// // // Log function with L0, L1, L2 levels
// // function logToFile(serviceName, logLevel, operationType, status, message) {
// //   const logDirectory = path.join(__dirname, "logs");
// //   if (!fs.existsSync(logDirectory)) {
// //     fs.mkdirSync(logDirectory); // Ensure the logs directory exists
// //   }
// //   const logFilePath = path.join(logDirectory, "MON-1.log");
// //   const timestamp = new Date().toISOString();
// //   const logMessage = `${timestamp} - ${logLevel} - ${serviceName} - ${operationType} - ${status} - ${message}\n`;
// //   fs.appendFileSync(logFilePath, logMessage, (err) => {
// //     if (err) console.error("Failed to write to log file:", err);
// //   });
// // }

// // // Initialize MongoDB
// // async function initializeMongoDB() {
// //   try {
// //     await mongoClient.connect();
// //     const db = mongoClient.db(process.env.MONGO_DB_NAME);
// //     deviceCollection = db.collection(process.env.MONGO_COLLECTION_NAME);
// //     logToFile("MON-1", "L1", "MongoDB", "SUCCESS", "Connected to MongoDB.");
// //   } catch (error) {
// //     logToFile("MON-1", "L1", "MongoDB", "FAILED", `Error: ${error.message}`);
// //     process.exit(1);
// //   }
// // }

// // // Fetch and process new device data
// // async function fetchAndProcessDevices() {
// //   try {
// //     db.connect((err) => {
// //       if (err) {
// //         logToFile("MON-1", "L1", "MySQL", "FAILED", `Error: ${err.message}`);
// //         return;
// //       }
// //       logToFile("MON-1", "L1", "MySQL", "SUCCESS", "Connected to MySQL.");
// //     });

// //     const deviceQuery = `
// //       SELECT dm.Serial_Nos, dm.Plant_id, dm.make, dm.model, dm.System_date_time,
// //              ps.url, ps.user_name, ps.api_key, ps.password
// //       FROM gsai_device_master dm
// //       LEFT JOIN gsai_plant_api_settings ps ON dm.Plant_id = ps.plant_id
// //       WHERE dm.System_date_time > ?;
// //     `;

// //     const lastProcessedTime = new Date(0);

// //     db.query(deviceQuery, [lastProcessedTime], async (err, results) => {
// //       if (err) {
// //         logToFile("MON-1", "L1", "MySQL", "FAILED", `Error: ${err.message}`);
// //         return;
// //       }

// //       logToFile(
// //         "MON-1",
// //         "L0",
// //         "Fetch",
// //         "SUCCESS",
// //         "Fetched devices from MySQL."
// //       );
// //       for (const device of results) {
// //         const document = {
// //           serialNumber: device.Serial_Nos,
// //           plantId: device.Plant_id,
// //           make: device.make,
// //           model: device.model,
// //           systemDateTime: device.System_date_time,
// //           url: device.url || "N/A",
// //           userName: device.user_name || "N/A",
// //           apiKey: device.api_key || "N/A",
// //           password: device.password || "N/A",
// //         };

// //         logToFile(
// //           "MON-1",
// //           "L2",
// //           "Process",
// //           "SUCCESS",
// //           `Processed device: ${JSON.stringify(document)}`
// //         );

// //         try {
// //           await deviceCollection.insertOne(document);
// //           logToFile(
// //             "MON-1",
// //             "L1",
// //             "MongoDB",
// //             "SUCCESS",
// //             `Inserted device into MongoDB: ${JSON.stringify(document)}`
// //           );
// //         } catch (mongoErr) {
// //           logToFile(
// //             "MON-1",
// //             "L2",
// //             "MongoDB",
// //             "FAILED",
// //             `Error inserting device: ${mongoErr.message}`
// //           );
// //         }

// //         if (new Date(device.System_date_time) > lastProcessedTime) {
// //           lastProcessedTime.setTime(
// //             new Date(device.System_date_time).getTime()
// //           );
// //         }
// //       }
// //     });
// //   } catch (error) {
// //     logToFile("MON-1", "L1", "Fetch", "FAILED", `Error: ${error.message}`);
// //   } finally {
// //     db.end((err) => {
// //       if (err) {
// //         logToFile("MON-1", "L1", "MySQL", "FAILED", `Error: ${err.message}`);
// //       } else {
// //         logToFile(
// //           "MON-1",
// //           "L1",
// //           "MySQL",
// //           "SUCCESS",
// //           "MySQL connection closed."
// //         );
// //       }
// //     });
// //   }
// // }

// // // Main function to initialize and run the process
// // (async () => {
// //   await initializeMongoDB();
// //   await fetchAndProcessDevices();
// // })();

// //with 15 min

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

// // Fetch and insert data into MongoDB
// async function fetchAndInsertData() {
//   try {
//     const plantQuery = `
//       SELECT * FROM Gsai_PlantMaster;
//     `;

//     const deviceQuery = `
//       SELECT * FROM gsai_device_master;
//     `;

//     const apiSettingsQuery = `
//       SELECT * FROM gsai_plant_api_settings;
//     `;

//     const plants = await query(plantQuery);
//     const devices = await query(deviceQuery);
//     const apiSettings = await query(apiSettingsQuery);

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
//   await fetchAndInsertData(); // Initial run
// })();

// Load environment variables from .env file
require("dotenv").config();
const mysql = require("mysql");
const { MongoClient } = require("mongodb");
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");

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

// Variable to store the maximum `create_date`
let maxCreateTime = null;

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

// Setup MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    logToFile(
      "Mon1",
      "L2",
      "Database",
      "FAILED",
      `Error connecting to MySQL: ${err.stack}`
    );
    return;
  }
  logToFile("Mon1", "L1", "Database", "SUCCESS", "Connected to MySQL.");
});

// MySQL query helper
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Function to fetch all records initially and set maxCreateTime
async function initializeAndInsertData() {
  try {
    const plantQuery = `SELECT * FROM Gsai_PlantMaster;`;
    const deviceQuery = `SELECT * FROM gsai_device_master;`;
    const apiSettingsQuery = `SELECT * FROM gsai_plant_api_settings;`;

    const plants = await query(plantQuery);
    const devices = await query(deviceQuery);
    const apiSettings = await query(apiSettingsQuery);

    if (devices.length === 0) {
      logToFile("Mon1", "L1", "Initialize", "INFO", "No records found.");
      return;
    }

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
      `Max create_date initialized to: ${new Date(maxCreateTime).toISOString()}`
    );
  } catch (error) {
    logToFile(
      "Mon1",
      "L2",
      "Initialize",
      "FAILED",
      `Error during initialization: ${error.message}`
    );
  }
}

// Function to fetch new records based on maxCreateTime
async function fetchAndInsertData() {
  try {
    if (!maxCreateTime) {
      logToFile(
        "Mon1",
        "L1",
        "FetchInsert",
        "INFO",
        "Max create_date not set. Skipping fetch."
      );
      return;
    }

    const deviceQuery = `
      SELECT * FROM gsai_device_master
      WHERE create_date > ?;
    `;

    const devices = await query(deviceQuery, [new Date(maxCreateTime)]);

    if (devices.length === 0) {
      logToFile("Mon1", "L1", "FetchInsert", "INFO", "No new records found.");
      return;
    }

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
  } catch (error) {
    logToFile(
      "Mon1",
      "L2",
      "FetchInsert",
      "FAILED",
      `Error during fetch and insert: ${error.message}`
    );
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

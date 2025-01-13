// require("dotenv").config();
// const express = require("express");
// const crypto = require("crypto");
// const { Container } = require("rhea-promise");
// const fs = require("fs");
// const { MongoClient } = require("mongodb");
// const path = require("path");
// const app = express();
// const port = 3000;

// app.use(express.json());

// const mongoClient = new MongoClient(process.env.MONGO_URI);

// // Logging function
// function logToFile(serviceName, logLevel, operationType, status, message) {
//   const now = new Date();
//   const timestamp = now.toISOString();
//   const logDirectory = path.join(__dirname, "logs");
//   if (!fs.existsSync(logDirectory)) {
//     fs.mkdirSync(logDirectory);
//   }
//   const logFilePath = path.join(logDirectory, "m2.log");
//   fs.appendFile(
//     logFilePath,
//     `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`,
//     (err) => {
//       if (err) console.error("Failed to write to log file:", err);
//     }
//   );
// }

// // Send message to queue
// async function sendMessageToQueue(queueName, messageData) {
//   const container = new Container();
//   try {
//     const connection = await container.connect({
//       host: process.env.ACTIVE_MQ_HOST,
//       port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
//       username: process.env.ACTIVE_MQ_USERNAME,
//       password: process.env.ACTIVE_MQ_PASSWORD,
//       transport: "tcp",
//     });
//     const sender = await connection.createSender(queueName);
//     await sender.send({ body: JSON.stringify(messageData) });
//     logToFile(
//       "M2",
//       "L2",
//       "write",
//       "success",
//       `Message sent to ${queueName}: ${JSON.stringify(messageData)}`
//     );
//     await sender.close();
//     await connection.close();
//   } catch (error) {
//     logToFile(
//       "M2",
//       "L2",
//       "write",
//       "error",
//       `Failed to send message to queue: ${error.message}`
//     );
//   }
// }

// // Fetch and process data from MongoDB
// async function fetchAndProcessData() {
//   await mongoClient.connect();
//   const db = mongoClient.db(process.env.MONGO_DB_NAME);
//   const collection = db.collection(process.env.MONGO_COLLECTION_NAME);
//   const cursor = collection.find({});

//   while (await cursor.hasNext()) {
//     const document = await cursor.next();
//     let constructedUrl = "",
//       headers = {};

//     // Construct URL based on `make`
//     switch (document.make.toLowerCase()) {
//       case "solaredge":
//         const nowUtc = new Date();
//         const formattedStartTime = `${nowUtc.getUTCFullYear()}-${(
//           nowUtc.getUTCMonth() + 1
//         )
//           .toString()
//           .padStart(2, "0")}-${nowUtc
//           .getUTCDate()
//           .toString()
//           .padStart(2, "0")}%20${nowUtc
//           .getUTCHours()
//           .toString()
//           .padStart(2, "0")}:${nowUtc
//           .getUTCMinutes()
//           .toString()
//           .padStart(2, "0")}:00`;
//         const endTimeUtc = new Date(nowUtc.getTime() + 15 * 60000);
//         const formattedEndTime = `${endTimeUtc.getUTCFullYear()}-${(
//           endTimeUtc.getUTCMonth() + 1
//         )
//           .toString()
//           .padStart(2, "0")}-${endTimeUtc
//           .getUTCDate()
//           .toString()
//           .padStart(2, "0")}%20${endTimeUtc
//           .getUTCHours()
//           .toString()
//           .padStart(2, "0")}:${endTimeUtc
//           .getUTCMinutes()
//           .toString()
//           .padStart(2, "0")}:00`;

//         constructedUrl = `${document.api_url}${document.model}/${document.serial_number}/data?startTime=${formattedStartTime}&endTime=${formattedEndTime}&api_key=${document.api_key}`;
//         break;

//       case "solis":
//         const contentMd5 = crypto
//           .createHash("md5")
//           .update(JSON.stringify(document.headers))
//           .digest("hex");
//         const stringToSign = `POST\n${contentMd5}\napplication/json\n${new Date().toUTCString()}\n${
//           document.api_url
//         }`;
//         const signature = crypto
//           .createHmac("sha1", process.env.SECRET_KEY)
//           .update(stringToSign)
//           .digest("base64");
//         headers = {
//           "Content-MD5": contentMd5,
//           "Content-Type": "application/json",
//           Date: new Date().toUTCString(),
//           Signature: signature,
//           Api_key: document.api_key,
//         };
//         constructedUrl = document.api_url;
//         break;

//       case "solarman":
//         constructedUrl = `${document.api_url}?api_key=${document.api_key}`;
//         break;

//       default:
//         logToFile(
//           "M2",
//           "L1",
//           "constructUrl",
//           "error",
//           `Unrecognized device make: ${document.make}`
//         );
//         continue;
//     }

//     const messageData = {
//       deviceMake: document.make,
//       device_id: document.device_id,
//       master_device_id: document.master_device_id,
//       constructedUrl,
//       headers,
//       metadata: {
//         plant_id: document.plant_id,
//         plant_name: document.plant_name,
//         latitude: document.latitude,
//         longitude: document.longitude,
//         capacity: document.capacity,
//         capacity_unit: document.capacity_unit,
//         plant_category: document.plant_category,
//         make: document.make,
//         model: document.model,
//         serial_number: document.serial_number,
//         system_date_time: document.system_date_time,
//         api_url: document.api_url,
//         api_key: document.api_key,
//       },
//     };

//     await sendMessageToQueue("/request", messageData);
//     logToFile(
//       "M2",
//       "L1",
//       "processData",
//       "success",
//       `Processed data for device: ${document.device_id}`
//     );
//   }

//   await mongoClient.close();
// }

// fetchAndProcessData().catch(console.error);

// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const { Container } = require("rhea-promise");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);

// Logging function
function logToFile(serviceName, logLevel, operationType, status, message) {
  const now = new Date();
  const timestamp = now.toISOString();
  const logDirectory = path.join(__dirname, "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }
  const logFilePath = path.join(logDirectory, "m2.log");
  fs.appendFile(
    logFilePath,
    `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`,
    (err) => {
      if (err) console.error("Failed to write to log file:", err);
    }
  );
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
      "L2",
      "write",
      "success",
      `Message sent to ${queueName}: ${JSON.stringify(messageData)}`
    );
    await sender.close();
    await connection.close();
  } catch (error) {
    logToFile(
      "M2",
      "L2",
      "write",
      "error",
      `Failed to send message to queue: ${error.message}`
    );
  }
}

// Fetch and process data from MongoDB
async function fetchAndProcessData() {
  await mongoClient.connect();
  const db = mongoClient.db(process.env.MONGO_DB_NAME);
  const collection = db.collection(process.env.MONGO_COLLECTION_NAME);
  const cursor = collection.find({});

  while (await cursor.hasNext()) {
    const document = await cursor.next();
    let headers = {};

    // Construct URL based on `make`
    switch (document.make.toLowerCase()) {
      case "solaredge":
        const nowUtc = new Date();
        const formattedStartTime = `${nowUtc.getUTCFullYear()}-${(
          nowUtc.getUTCMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${nowUtc
          .getUTCDate()
          .toString()
          .padStart(2, "0")}%20${nowUtc
          .getUTCHours()
          .toString()
          .padStart(2, "0")}:${nowUtc
          .getUTCMinutes()
          .toString()
          .padStart(2, "0")}:00`;
        const endTimeUtc = new Date(nowUtc.getTime() + 15 * 60000);
        const formattedEndTime = `${endTimeUtc.getUTCFullYear()}-${(
          endTimeUtc.getUTCMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${endTimeUtc
          .getUTCDate()
          .toString()
          .padStart(2, "0")}%20${endTimeUtc
          .getUTCHours()
          .toString()
          .padStart(2, "0")}:${endTimeUtc
          .getUTCMinutes()
          .toString()
          .padStart(2, "0")}:00`;

        // Handle multiple serial numbers
        const serialNumbers = document.serial_number
          .split(",")
          .map((sn) => sn.trim());
        for (const serialNumber of serialNumbers) {
          const constructedUrl = `${document.api_url}${document.model}/${serialNumber}/data?startTime=${formattedStartTime}&endTime=${formattedEndTime}&api_key=${document.api_key}`;

          const messageData = {
            deviceMake: document.make,
            device_id: document.device_id,
            master_device_id: document.master_device_id,
            constructedUrl,
            headers,
            metadata: {
              DeviceUUID: document.device_id,
              DeviceMake: document.make,
              plant_id: document.plant_id,
              plant_name: document.plant_name,
              latitude: document.latitude,
              longitude: document.longitude,
              capacity: document.capacity,
              capacity_unit: document.capacity_unit,
              plant_category: document.plant_category,
              make: document.make,
              model: document.model,
              serial_number: serialNumber,
              system_date_time: document.system_date_time,
              api_url: document.api_url,
              api_key: document.api_key,
            },
          };

          await sendMessageToQueue("/request", messageData);
        }
        break;

      case "solis":
        const contentMd5 = crypto
          .createHash("md5")
          .update(JSON.stringify(document.headers))
          .digest("hex");
        const stringToSign = `POST\n${contentMd5}\napplication/json\n${new Date().toUTCString()}\n${
          document.api_url
        }`;
        const signature = crypto
          .createHmac("sha1", process.env.SECRET_KEY)
          .update(stringToSign)
          .digest("base64");
        headers = {
          "Content-MD5": contentMd5,
          "Content-Type": "application/json",
          Date: new Date().toUTCString(),
          Signature: signature,
          Api_key: document.api_key,
        };
        const constructedUrl = document.api_url;

        const messageData = {
          deviceMake: document.make,
          device_id: document.device_id,
          master_device_id: document.master_device_id,
          constructedUrl,
          headers,
          metadata: {
            plant_id: document.plant_id,
            plant_name: document.plant_name,
            latitude: document.latitude,
            longitude: document.longitude,
            capacity: document.capacity,
            capacity_unit: document.capacity_unit,
            plant_category: document.plant_category,
            make: document.make,
            model: document.model,
            serial_number: document.serial_number,
            system_date_time: document.system_date_time,
            api_url: document.api_url,
            api_key: document.api_key,
          },
        };

        await sendMessageToQueue("/request", messageData);
        break;

      case "solarman":
        const solarmanUrl = `${document.api_url}?api_key=${document.api_key}`;
        const solarmanMessageData = {
          deviceMake: document.make,
          device_id: document.device_id,
          master_device_id: document.master_device_id,
          constructedUrl: solarmanUrl,
          headers,
          metadata: {
            plant_id: document.plant_id,
            plant_name: document.plant_name,
            latitude: document.latitude,
            longitude: document.longitude,
            capacity: document.capacity,
            capacity_unit: document.capacity_unit,
            plant_category: document.plant_category,
            make: document.make,
            model: document.model,
            serial_number: document.serial_number,
            system_date_time: document.system_date_time,
            api_url: document.api_url,
            api_key: document.api_key,
          },
        };

        await sendMessageToQueue("/request", solarmanMessageData);
        break;

      default:
        logToFile(
          "M2",
          "L1",
          "constructUrl",
          "error",
          `Unrecognized device make: ${document.make}`
        );
        continue;
    }

    logToFile(
      "M2",
      "L1",
      "processData",
      "success",
      `Processed data for device: ${document.device_id}`
    );
  }

  await mongoClient.close();
}

fetchAndProcessData().catch(console.error);

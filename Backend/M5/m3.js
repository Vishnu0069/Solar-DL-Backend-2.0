// Load environment variables from .env file
require("dotenv").config();

// Importing necessary modules
const { Container } = require("rhea-promise");
const https = require("https");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Updated Logging function
function logToFile(serviceName, logLevel, operationType, status, message) {
  const now = new Date();
  const timestamp = now.toISOString();
  const logMessage = `${timestamp}\t${logLevel}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;

  // Ensure the logs directory exists
  const logDirectory = path.join(__dirname, "logs");
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  // Write the log message to M3.log inside the logs directory
  const logFilePath = path.join(logDirectory, "M3.log");
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
}

// Function to send a message to a topic
const sendMessageToTopic = async (messageBody) => {
  const container = new Container();
  try {
    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: "tcp",
    });

    const sender = await connection.createSender("/response");
    await sender.send({ body: messageBody });

    logToFile(
      "M3",
      "L1",
      "M3 Service",
      "success",
      "Message sent to /response topic."
    );
    await sender.close();
    await connection.close();
  } catch (error) {
    logToFile(
      "M3",
      "L2",
      "write",
      "error",
      "Failed to send message to /response topic: " + error.message
    );
  }
};

// Function to listen to a queue for messages
const listenToQueue = async () => {
  const container = new Container();
  try {
    const connection = await container.connect({
      host: process.env.ACTIVE_MQ_HOST,
      port: parseInt(process.env.ACTIVE_MQ_PORT, 10),
      username: process.env.ACTIVE_MQ_USERNAME,
      password: process.env.ACTIVE_MQ_PASSWORD,
      transport: "tcp",
    });

    const receiverOptions = {
      source: {
        address: "/request",
      },
    };

    const receiver = await connection.createReceiver(receiverOptions);
    receiver.on("message", async (context) => {
      try {
        const messageBody = context.message.body
          ? JSON.parse(context.message.body.toString())
          : {};

        logToFile(
          "M3",
          "L1",
          "read",
          "success",
          "Received message: " + JSON.stringify(messageBody)
        );

        const { deviceMake, constructedUrl, metadata, headers } = messageBody;

        // Validate deviceMake
        if (!deviceMake || typeof deviceMake !== "string") {
          logToFile(
            "M3",
            "L2",
            "read",
            "error",
            "Invalid message: 'deviceMake' is missing or not a string. Message: " +
              JSON.stringify(messageBody)
          );
          context.delivery.reject();
          return;
        }

        switch (deviceMake.toLowerCase()) {
          case "solaredge":
            https
              .get(constructedUrl, (res) => {
                let data = "";
                res.on("data", (chunk) => {
                  data += chunk;
                });
                res.on("end", async () => {
                  logToFile(
                    "M3",
                    "L2",
                    "read",
                    "success",
                    "Response from SolarEdge API: " + data
                  );
                  const responsePayload = {
                    deviceMake: "solaredge",
                    metadata,
                    responseData: JSON.parse(data),
                  };
                  await sendMessageToTopic(JSON.stringify(responsePayload));
                });
              })
              .on("error", (err) => {
                logToFile(
                  "M3",
                  "L2",
                  "read",
                  "error",
                  "Error calling SolarEdge API: " + err.message
                );
              });
            break;

          case "solis": {
            const { body } = headers;
            const requestBody = JSON.stringify(body);
            const authHeader = `API ${headers.Api_key}:${headers.Signature}`;

            axios
              .post(constructedUrl, requestBody, {
                headers: {
                  "Content-MD5": headers["Content-MD5"],
                  "Content-Type": headers["Content-Type"],
                  Date: headers.Date,
                  Authorization: authHeader,
                },
              })
              .then(async (response) => {
                const responsePayload = {
                  deviceMake: deviceMake || "Unknown", // Default if missing
                  metadata,
                  deviceUUID: metadata.device_id || "Unknown", // Ensuring UUID is added
                  deviceMake: deviceMake || "Unknown", // Include the deviceMake
                  responseData: response.data,
                };
                await sendMessageToTopic(JSON.stringify(responsePayload));
              })
              .catch((error) => {
                logToFile(
                  "M3",
                  "L2",
                  "read",
                  "error",
                  "Error making API call to Solis: " + error.message
                );
              });
            break;
          }

          default:
            logToFile(
              "M3",
              "L2",
              "read",
              "error",
              "DeviceMake not recognized. No API call made. Message: " +
                JSON.stringify(messageBody)
            );
            break;
        }

        context.delivery.accept();
      } catch (error) {
        logToFile(
          "M3",
          "L2",
          "read",
          "error",
          "Error processing message: " + error.message
        );
        context.delivery.reject();
      }
    });

    logToFile(
      "M3",
      "L2",
      "listen",
      "success",
      "M3 is listening for messages on /request..."
    );
  } catch (error) {
    logToFile(
      "M3",
      "L2",
      "connect",
      "error",
      "Failed to connect or listen to queue: " + error.message
    );
  }
};

listenToQueue().catch(console.error);

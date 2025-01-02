const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken"); // Import JWT package for token verification
const router = express.Router();
require("dotenv").config(); // Load environment variables from .env

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]; // Get the token from the Authorization header

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify the token using the JWT_SECRET from environment variables
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); // Assuming Bearer token format
    req.user = decoded; // Store the decoded token in the request object
    next(); // Continue to the next middleware/route handler
  } catch (err) {
    return res.status(403).json({ error: "Invalid token." });
  }
}

// A POST route to handle make and plantSerialNumber and make API call to SolarEdge
router.post("/", verifyToken, async (req, res) => {
  const { make, plantSerialNumber } = req.body; // Extract make and plantSerialNumber from request body

  if (!make || !plantSerialNumber) {
    return res
      .status(400)
      .json({ error: "Both make and plantSerialNumber are required" });
  }

  // Check if the make is Solaredge
  if (make.toLowerCase() === "solaredge") {
    const apiKey = process.env.SOLAREDGE_API_KEY;

    // URL for SolarEdge API (using the provided plantSerialNumber)
    const solarEdgeUrl = `https://monitoringapi.solaredge.com/equipment/${plantSerialNumber}/list?api_key=${apiKey}`;

    try {
      // Make the API call to SolarEdge
      const response = await axios.get(solarEdgeUrl);

      // Filter the response data to include only inverters with the model "SE27.6K-IN000NNN2"
      const inverters = response.data.reporters.list.filter(
        (item) => item.model === "SE27.6K-IN000NNN2"
      );

      // Prepare the final response structure
      res.json({
        message: "API call successful",
        manufacturer: make, // Add the manufacturer (which is the same as make)
        data: {
          dataLogger: {
            model: "SE27.6K-IN000NNN2", // Set the model
            inverters: {
              count: inverters.length, // Count of matching inverters
              list: inverters, // List of matching inverters
            },
          },
        },
      });
    } catch (error) {
      if (error.response) {
        // Log only the status code and return a clean message
        console.error("Error status code:", error.response.status);
        res
          .status(error.response.status)
          .json({
            error: `Failed to fetch data from SolarEdge API: Status Code ${error.response.status}`,
          });
      } else {
        console.error("Error:", error.message);
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  } else {
    // If the make is not Solaredge, return an error response
    res.status(400).json({ error: "Unsupported device make" });
  }
});

module.exports = router;

//Below is the one with the Excel file

// const express = require('express');
// const axios = require('axios');
// const jwt = require('jsonwebtoken');
// const fs = require('fs');
// const path = require('path');
// const { Parser } = require('json2csv');  // Package to generate CSV
// const router = express.Router();
// require('dotenv').config(); // Load environment variables from .env

// // Middleware to verify JWT token
// function verifyToken(req, res, next) {
//     const token = req.headers['authorization']; // Get the token from the Authorization header

//     if (!token) {
//         return res.status(401).json({ error: 'Access denied. No token provided.' });
//     }

//     try {
//         // Verify the token using the JWT_SECRET from environment variables
//         const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);  // Assuming Bearer token format
//         req.user = decoded;  // Store the decoded token in the request object
//         next();  // Continue to the next middleware/route handler
//     } catch (err) {
//         return res.status(403).json({ error: 'Invalid token.' });
//     }
// }

// // A POST route to handle make and plantSerialNumber, make API call to SolarEdge, and generate CSV
// router.post('/', verifyToken, async (req, res) => {
//     const { make, plantSerialNumber } = req.body; // Extract make and plantSerialNumber from request body

//     if (!make || !plantSerialNumber) {
//         return res.status(400).json({ error: 'Both make and plantSerialNumber are required' });
//     }

//     // Check if the make is Solaredge
//     if (make.toLowerCase() === 'solaredge') {
//         const apiKey = process.env.SOLAREDGE_API_KEY;

//         // URL for SolarEdge API (using the provided plantSerialNumber)
//         const solarEdgeUrl = `https://monitoringapi.solaredge.com/equipment/${plantSerialNumber}/list?api_key=${apiKey}`;

//         try {
//             // Make the API call to SolarEdge
//             const response = await axios.get(solarEdgeUrl);

//             // Create an empty array to hold data loggers and their respective inverters
//             const csvData = [];

//             // Group inverters by their model (which acts as the datalogger in your case)
//             const dataLoggers = {};

//             response.data.reporters.list.forEach(item => {
//                 // Check if the inverter model is already a datalogger
//                 if (!dataLoggers[item.model]) {
//                     // Create a new datalogger entry
//                     dataLoggers[item.model] = {
//                         device_type: 'datalogger',
//                         make: item.manufacturer,
//                         model_no: item.model,
//                         serial_no: null,  // Using plantSerialNumber as the serial for datalogger
//                         version: null,
//                         firmware_ver_1: null,
//                         firmware_ver_2: null,
//                         rating: null,  // Example value for datalogger
//                         master_device_serial: null // No master device for datalogger itself
//                     };
//                 }

//                 // Add the inverters associated with the datalogger to csvData
//                 csvData.push({
//                     device_type: 'inverter',
//                     make: item.manufacturer,
//                     model_no: null,
//                     serial_no: item.serialNumber,
//                     version: null,
//                     firmware_ver_1: null,
//                     firmware_ver_2: null,
//                     rating: null,
//                     master_device_serial: item.model  // Reference to datalogger model
//                 });
//             });

//             // Add each datalogger to the start of the CSV data, to ensure it comes on top
//             Object.values(dataLoggers).forEach(datalogger => {
//                 csvData.unshift(datalogger);
//             });

//             // Convert the JSON data to CSV format
//             const fields = ['device_type', 'make', 'model_no', 'serial_no', 'version', 'firmware_ver_1', 'firmware_ver_2', 'rating', 'master_device_serial'];
//             const json2csvParser = new Parser({ fields });
//             const csv = json2csvParser.parse(csvData);

//             // Define the CSV file path
//             const filePath = path.join(__dirname, '../sync', 'equipment_data.csv');

//             // Save the CSV file in /sync directory
//             fs.writeFileSync(filePath, csv);

//             // Return the link to download the CSV file
//             res.json({
//                 message: 'CSV file generated successfully',
//                 downloadLink: `https://solar-api.antsai.in/sync/equipment_data.csv`  // Link to access the CSV file
//             });
//         } catch (error) {
//             if (error.response) {
//                 // Log only the status code and return a clean message
//                 console.error('Error status code:', error.response.status);
//                 res.status(error.response.status).json({ error: `Failed to fetch data from SolarEdge API: Status Code ${error.response.status}` });
//             } else {
//                 console.error('Error:', error.message);
//                 res.status(500).json({ error: 'An unknown error occurred' });
//             }
//         }
//     } else {
//         // If the make is not Solaredge, return an error response
//         res.status(400).json({ error: 'Unsupported device make' });
//     }
// });

// // Serve the CSV file when requested
// router.get('/equipment_data.csv', (req, res) => {
//     const filePath = path.join(__dirname, '../sync', 'equipment_data.csv');

//     // Check if the file exists
//     if (fs.existsSync(filePath)) {
//         res.download(filePath);  // Send the file as a response
//     } else {
//         res.status(404).json({ error: 'File not found' });
//     }
// });

// module.exports = router;

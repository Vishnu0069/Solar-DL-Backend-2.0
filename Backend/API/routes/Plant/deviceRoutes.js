// routes/deviceRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../../db"); // Database connection
const { v4: uuidv4 } = require("uuid"); // Importing uuidv4 to generate UUIDs
const { body, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

// Updated route for device information
router.post(
  "/deviceInfo",
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Plant_id, user_id, model, devices } = req.body;

    if (!Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({ message: "Devices array is required" });
    }

    const current_date_time = new Date().toISOString();
    const system_date_time = new Date().toISOString();

    try {
      const deviceMap = new Map(); // To store Data Logger device UUIDs by type
      const deviceData = []; // To batch insert data

      for (const device of devices) {
        const Device_id = uuidv4(); // Generate a unique UUID for the device
        let masterDeviceId = null;

        // If the device is a Data Logger, store its Device_id
        if (device.Device_type === "Data Logger") {
          //console.log("Storing Data Logger device_id:", Device_id);
          deviceMap.set("Data Logger", Device_id); // Save Data Logger's device_id
        }

        // If the device is an Inverter, assign masterDeviceId from Data Logger
        if (device.Device_type === "Inverter") {
          masterDeviceId = deviceMap.get("Data Logger") || null;
          //console.log("Assigning master_device_id to Inverter:", masterDeviceId);
        }

        // Prepare device data for insertion
        deviceData.push([
          Device_id, // Generated UUID for the device
          masterDeviceId, // master_device_id (Data Logger for Inverter)
          device.Device_type || null, // Device type
          device.Make || null, // Make
          model || null, // Global model applied to all devices
          current_date_time, // create_date
          current_date_time, // last_update_date
          user_id, // Created by user ID
          user_id, // Last updated by user ID
          0, // delete_flag
          null, // uom
          Plant_id || null, // Plant ID
          device.Rating || null, // Rating
          device.Quantity || null, // Quantity
          device.Serial_Nos || null, // Serial numbers
          system_date_time, // System date-time
        ]);
      }

      // Insert all devices into the database
      const sql = `
        INSERT INTO gsai_device_master (
          device_id, 
          master_device_id, 
          device_type_id,  
          make, 
          model, 
          create_date, 
          last_update_date, 
          create_by_userid, 
          last_update_userid, 
          delete_flag, 
          uom, 
          Plant_id, 
          Rating, 
          Quantity, 
          Serial_Nos, 
          System_date_time
        ) VALUES ?
      `;
      await pool.query(sql, [deviceData]);

      res.status(201).json({ message: "Device information stored successfully" });
    } catch (error) {
      console.error("Error inserting data into the database:", error);
      res.status(500).json({ message: "Error storing device information" });
    }
  }
);




/*
router.post(
  "/deviceInfo",
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Plant_id, user_id, model, devices } = req.body;

    if (!Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({ message: "Devices array is required" });
    }

    if (!model) {
      return res.status(400).json({ message: "Model is required" });
    }

    const current_date_time = new Date().toISOString();
    const system_date_time = new Date().toISOString();

    try {
      const deviceMap = new Map(); // To store logger device UUIDs
      const deviceData = []; // To batch insert data

      for (const device of devices) {
        const Device_id = uuidv4(); // Generate a unique UUID for the device
        let masterDeviceId = null;

        // Assign master_device_id if device is dependent (e.g., inverter)
        if (device.Device_type === "Inverter" && device.loggerId) {
          masterDeviceId = deviceMap.get(device.loggerId) || null;
        }

        // If it's a logger, save the UUID in the map for future references
        if (device.Device_type === "Logger" && device.uniqueId) {
          deviceMap.set(device.uniqueId, Device_id);
        }

        deviceData.push([
          Device_id, // Generated UUID for the device
          masterDeviceId, // master_device_id for dependent devices
          device.Device_type || null, // Device type
          device.Make || null, // Make
          model || null, // Global model applied to all devices
          current_date_time, // create_date
          current_date_time, // last_update_date
          user_id, // Created by user ID
          user_id, // Last updated by user ID
          0, // delete_flag
          null, // uom
          Plant_id || null, // Plant ID
          device.Rating || null, // Rating
          device.Quantity || null, // Quantity
          device.Serial_Nos || null, // Serial numbers
          system_date_time, // System date-time
        ]);
      }

      // Insert all devices into the database
      const sql = `
        INSERT INTO gsai_device_master (
          device_id, 
          master_device_id, 
          device_type_id,  
          make, 
          model, 
          create_date, 
          last_update_date, 
          create_by_userid, 
          last_update_userid, 
          delete_flag, 
          uom, 
          Plant_id, 
          Rating, 
          Quantity, 
          Serial_Nos, 
          System_date_time
        ) VALUES ?
      `;
      await pool.query(sql, [deviceData]);

      res.status(201).json({ message: "Device information stored successfully" });
    } catch (error) {
      console.error("Error inserting data into the database:", error);
      res.status(500).json({ message: "Error storing device information" });
    }
  }
);*/


module.exports = router;

//just load the device data in one record 
/*
router.post(
  "/deviceInfo",
  auth,
  [
    // Validation rules
    body("Plant_id").notEmpty().withMessage("Plant_id is required"),
    body("user_id").notEmpty().withMessage("user_id is required"),
    body("Device_type").notEmpty().withMessage("Device_type is required"),
    //body("model").notEmpty().withMessage("Model is required"), // Ensure model validation
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from the request body
    const {
      Plant_id,
      user_id,
      Device_type,
      Make,
      Rating,
      Quantity,
      Serial_Nos,
      model,
    } = req.body;

    // Generate a new UUID for Device_id
    const Device_id = uuidv4();

    // Generate timestamps
    const system_date_time = new Date().toISOString();
    const current_date_time = new Date().toISOString();

    try {
<<<<<<< HEAD
      // SQL query to insert data into the database
      const sql = `INSERT INTO gsai_device_master (
                            device_id, 
                            master_device_id, 
                            device_type_id,  
                            make, 
                            model, 
                            create_date, 
                            last_update_date, 
                            create_by_userid, 
                            last_update_userid, 
                            delete_flag, 
                            uom, 
                            Plant_id, 
                            Rating, 
                            Quantity, 
                            Serial_Nos, 
                            System_date_time
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
=======
      const sql = `
        INSERT INTO gsai_device_master (
          device_id, 
          master_device_id, 
          device_type_id,  
          make, 
          model, 
          create_date, 
          last_update_date, 
          create_by_userid, 
          last_update_userid, 
          delete_flag, 
          uom, 
          Plant_id, 
          Rating, 
          Quantity, 
          Serial_Nos, 
          System_date_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // Execute the SQL query
      await pool.execute(sql, [
        Device_id, // Generated UUID for the device
        null, // master_device_id
        Device_type || null, // Device type
        Make || null, // Make
        model || null, // Model from the request body
        current_date_time, // Creation date
        current_date_time, // Last update date
        user_id, // Created by user ID
        user_id, // Last updated by user ID
        0, // delete_flag
        null, // uom (Unit of Measure, if any)
        Plant_id || null, // Plant ID
        Rating || null, // Rating
        Quantity || null, // Quantity
        Serial_Nos || null, // Serial numbers
        system_date_time, // System date-time
      ]);

      return res.status(201).json({ message: "Device information stored successfully" });
    } catch (error) {
      console.error("Error inserting data into the database:", error);
      return res.status(500).json({ message: "Error storing device information" });
    }
  }
);

module.exports = router;*/
>>>>>>> 067cb99b23ccd8687f20b54eee3955823f770602

      // Log the parameters being passed to the query
      /* console.log("Inserting values:", [
                Device_id,
                null,
                Device_type || null,
                Make || null,
                null,
                current_date_time,
                current_date_time,
                user_id,             // This should be populated
                user_id,             // This should be populated
                0,
                null,
                Plant_id || null,
                Rating || null,
                Quantity || null,
                Serial_Nos || null,
                current_date_time
            ]);

            // You need to ensure you have 16 values for the 16 columns listed.
            await db.execute(sql, [
                Device_id,                // Use the newly generated UUID
                //Device_id || null,           // UUID for device_id
                null,                        // master_device_id set to null (assuming no value provided)
                //Device_type || null,        // Device type ID (ensure this is properly resolved)
                Device_type || null,         // Set device_type_id to Device_type
                Make || null,                // Make
                null,                        // Model (set to null)
                current_date_time,           // create_date
                current_date_time,           // last_update_date (both dates the same at insertion)
                null,                        // create_by_userid set to null
                null,                        // last_update_userid set to null
                0,                           // delete_flag set to 0
                null,                        // uom set to null (assuming no value provided)
                Plant_id || null,            // Plant_id from the request body
                Rating || null,              // Rating from the request body
                Quantity || null,            // Quantity from the request body
                Serial_Nos || null,          // Serial_Nos from the request body
                system_date_time             // System_date_time
            ]);

      // Execute the SQL query with appropriate values
      await pool.execute(sql, [
        Device_id, // Generated UUID for the device
        null, // master_device_id
        Device_type || null, // Device type
        Make || null, // Make
        model || null, // Model
        current_date_time, // Creation date
        current_date_time, // Last update date
        user_id, // Created by user ID
        user_id, // Last updated by user ID
        0, // delete_flag
        null, // uom (Unit of Measure, if any)
        Plant_id || null, // Plant ID
        Rating || null, // Rating
        Quantity || null, // Quantity
        Serial_Nos || null, // Serial numbers
        system_date_time, // System date-time
      ]);

      return res.status(201).json({ message: "Device information stored successfully" });
    } catch (error) {
      console.error("Error inserting data into the database:", error);
      return res.status(500).json({ message: "Error storing device information" });
    }
  }
);*/


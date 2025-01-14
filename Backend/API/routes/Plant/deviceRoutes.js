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
  [
    // Validation rules
    body("Plant_id").notEmpty().withMessage("Plant_id is required"),
    body("user_id").notEmpty().withMessage("user_id is required"),
    body("Device_type").notEmpty().withMessage("Device_type is required"),
    body("model").notEmpty().withMessage("Model is required"), // Ensure model validation
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

module.exports = router;

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
);

module.exports = router;*/

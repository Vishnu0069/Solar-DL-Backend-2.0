// routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const db = require("../../db"); // Database connection
const { v4: uuidv4 } = require('uuid'); // Importing uuidv4 to generate UUIDs


// New route for device information
// Updated route for device information
router.post('/deviceInfo', async (req, res) => {
    const { 
        Plant_id, 
        Device_type, // This will be used for device_type_id, 
        Make, 
        Rating, 
        Quantity, 
        Serial_Nos 
    } = req.body;

    // Generate a new UUID for Device_id
    const Device_id = uuidv4(); 

    // Generate the system & current date and time in the format YYYY-MM-DD HH:MM:SS
    const system_date_time = new Date().toISOString(); // UTC format
    const current_date_time = new Date().toISOString(); // UTC format
    //const system_date_time = new Date().toISOString().slice(0, 19).replace('T', ' '); 
    //const current_date_time = new Date().toISOString().slice(0, 19).replace('T', ' '); 

    try {
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

        //console.log({ message: 'Device information stored successfully'});
        return res.status(201).json({ message: 'Device information stored successfully' });
    } catch (error) {
        console.error('Error inserting data into the database:', error);
        return res.status(500).json({ message: 'Error storing device information' });
    }
});

module.exports = router;
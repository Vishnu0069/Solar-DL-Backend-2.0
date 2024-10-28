// const express = require('express');
// const bcrypt = require('bcrypt');
// const { v4: uuidv4 } = require('uuid');  // Import the UUID generator
// const pool = require('../db');  // Import the DB connection
// const router = express.Router();

// router.post('/signup', async (req, res) => {
//     const { firstName, lastName, email, password, mobileNumber, pinCode, country, entityName, userRole, otp_status } = req.body;

//     // Input validation
//     if (!email || !password || !firstName || !lastName || !mobileNumber || !userRole || otp_status === undefined) {
//         return res.status(400).json({ message: 'All required fields, including otp_status, must be filled!' });
//     }

//     try {
//         // Check if a user with the same email already exists
//         const [existingUser] = await pool.query('SELECT email FROM gsai_user WHERE email = ?', [email]);

//         if (existingUser.length > 0) {
//             return res.status(409).json({ message: 'User already registered with this email.' });
//         }

//         // Generate UUIDs for both user_id and entityid 
//         const userId = uuidv4();
//         const companyId = uuidv4();  // Generating a new company ID

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

//         // Set otp_status field value to 1 if true, otherwise keep the original value
//         const otpStatusValue = otp_status === true ? 1 : 0;

//         // SQL Query to insert user data into the database, including the user_id and entityid 
//         const sql = `
//             INSERT INTO gsai_user (user_id, entityid , first_name, last_name, email, passwordhashcode, mobile_number, pin_code, country, entity_name, user_role, otp_status) 
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//         const values = [userId, companyId, firstName, lastName, email, hashedPassword, mobileNumber, pinCode, country, entityName, userRole, otpStatusValue];

//         await pool.query(sql, values);
//         res.status(201).json({ message: 'User registered successfully!' });
        
//     } catch (error) {
//         // Handle duplicate entry errors specifically
//         if (error.code === 'ER_DUP_ENTRY') {
//             return res.status(409).json({ message: 'User already registered with this email.' });
//         }

//         console.error('Signup error:', error);
//         return res.status(500).json({ message: 'Internal server error', error });
//     }
// });

// module.exports = router;


const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, mobileNumber, pinCode, country, entityName, otp_status } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName || !mobileNumber || otp_status === undefined) {
        return res.status(400).json({ message: 'All required fields, including otp_status, must be filled!' });
    }

    const connection = await pool.getConnection(); // Get a connection from the pool

    try {
        await connection.beginTransaction(); // Start a transaction

        // Check if a user with the same email already exists
        const [existingUser] = await connection.query('SELECT email FROM gsai_user WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            console.log("Debug: Email already exists:", email);
            await connection.rollback();
            return res.status(409).json({ message: 'User already registered with this email.' });
        }

        // Generate a unique Entity ID in uppercase
        let entityIdBase = entityName.replace(/\s+/g, '').toUpperCase();
        let entityId = entityIdBase;
        let counter = 1;

        // Loop to ensure entityId uniqueness
        while (true) {
            const [existingEntity] = await connection.query('SELECT entityid FROM EntityMaster WHERE entityid = ?', [entityId]);
            if (existingEntity.length === 0) break; // Unique entityId found
            entityId = `${entityIdBase}${counter}`; // Append counter if entityId exists
            counter++;
        }

        // Debugging information
        console.log('Generated unique entityId:', entityId);

        // Generate namespace
        const namespace = `gsai.greentek.${entityName.toLowerCase().replace(/\s+/g, '')}`;

        // Define default values
        const masterEntityId = '1111';
        const userRole = 'sysadmin';
        
        // Generate UUID for user_id
        const userId = uuidv4();

        // Debugging information
        console.log('Generated userId:', userId);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Set otp_status field value to 1 if true, otherwise keep the original value
        const otpStatusValue = otp_status === true ? 1 : 0;

        // Insert the new entity into EntityMaster with user details
        const entitySql = `
            INSERT INTO EntityMaster (
                entityid, entityname, namespace, masterentityid, country, contactfirstname, 
                contactlastname, email, mobile, address_line_1, address_line_2, GSTIN, Region
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL)`;
        
        const entityValues = [
            entityId, entityName, namespace, masterEntityId, country, firstName, 
            lastName, email, mobileNumber
        ];

        await connection.query(entitySql, entityValues);

        console.log("Debug: Entity inserted with entityId:", entityId);

        // SQL Query to insert user data into gsai_user table with entityid as a foreign key
        const userSql = `
            INSERT INTO gsai_user (user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number, pin_code, country, entity_name, user_role, otp_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const userValues = [userId, entityId, firstName, lastName, email, hashedPassword, mobileNumber, pinCode, country, entityName, userRole, otpStatusValue];

        await connection.query(userSql, userValues);

        console.log("Debug: User inserted with userId:", userId);

        await connection.commit(); // Commit the transaction
        res.status(201).json({ message: 'User and Entity registered successfully!' });

    } catch (error) {
        await connection.rollback(); // Rollback the transaction in case of error
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('Duplicate entry error:', error);
            return res.status(409).json({ message: 'Duplicate entry found. Check unique fields.', error });
        }

        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    } finally {
        connection.release(); // Release the connection back to the pool
    }
});

module.exports = router;

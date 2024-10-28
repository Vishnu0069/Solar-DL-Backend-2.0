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

    if (!email || !password || !firstName || !lastName || !mobileNumber || otp_status === undefined || !entityName) {
        return res.status(400).json({ message: 'All required fields, including otp_status and entityName, must be filled!' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [existingUser] = await connection.query('SELECT email FROM gsai_user WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'User already registered with this email.' });
        }

        // Generate unique Entity ID
        let entityIdBase = entityName.replace(/\s+/g, '').toUpperCase();
        let entityId = entityIdBase;
        let counter = 1;
        while (true) {
            const [existingEntity] = await connection.query('SELECT entityid FROM EntityMaster WHERE entityid = ?', [entityId]);
            if (existingEntity.length === 0) break;
            entityId = `${entityIdBase}${counter}`;
            counter++;
        }

        // Generate unique masterEntityId in the format ENTITYNAME-1111, ENTITYNAME-1112, etc.
        let masterEntityId = `${entityIdBase}-1111`;
        let masterCounter = 1111;
        while (true) {
            const [existingMasterEntity] = await connection.query('SELECT masterentityid FROM EntityMaster WHERE masterentityid = ?', [masterEntityId]);
            if (existingMasterEntity.length === 0) break;
            masterCounter++;
            masterEntityId = `${entityIdBase}-${masterCounter}`;
        }

        // Define the namespace
        const namespace = `gsai.greentek.${entityName.toLowerCase().replace(/\s+/g, '')}`;

        // Insert into EntityMaster, including dynamically generated masterEntityId
        const entitySql = `
            INSERT INTO EntityMaster (
                entityid, entityname, namespace, masterentityid, country, contactfirstname, 
                contactlastname, email, mobile, address_line_1, address_line_2, GSTIN, Region
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL)`;

        const entityValues = [
            entityId, entityName, namespace, masterEntityId, country, firstName, lastName, email, mobileNumber
        ];

        await connection.query(entitySql, entityValues);

        await connection.commit();
        console.log("Debug: EntityMaster insertion committed for entityId:", entityId);

        // Disable foreign key checks temporarily
        await connection.query('SET FOREIGN_KEY_CHECKS=0');

        await connection.beginTransaction();

        // Generate UUID for user_id
        const userId = uuidv4();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const otpStatusValue = otp_status ? 1 : 0;

        // Insert user data into gsai_user with generated entityId as foreign key
        const userSql = `
            INSERT INTO gsai_user (
                user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number, pin_code, country, entity_name, user_role, otp_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sysadmin', ?)`;

        const userValues = [userId, entityId, firstName, lastName, email, hashedPassword, mobileNumber, pinCode, country, entityName, otpStatusValue];
        const [userResult] = await connection.query(userSql, userValues);

        if (userResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json({ message: 'Failed to insert user in gsai_user.' });
        }

        await connection.commit();

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS=1');

        res.status(201).json({ message: 'User and Entity registered successfully!', entityId, masterEntityId });

    } catch (error) {
        await connection.rollback();
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error', error });
    } finally {
        connection.release();
    }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, mobileNumber, pinCode, country, entityName, otp_status } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName || !mobileNumber || otp_status === undefined || !entityName) {
        return res.status(400).json({ message: 'All required fields, including otp_status and entityName, must be filled!' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Check if a user with the same email already exists
        const [existingUser] = await connection.query('SELECT email FROM gsai_user WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'User already registered with this email.' });
        }

        // Generate a unique Entity ID in uppercase
        let entityIdBase = entityName.replace(/\s+/g, '').toUpperCase();
        let entityId = entityIdBase;
        let counter = 1;

        // Loop to ensure entityId uniqueness in EntityMaster
        while (true) {
            const [existingEntity] = await connection.query('SELECT entityid FROM EntityMaster WHERE entityid = ?', [entityId]);
            if (existingEntity.length === 0) break; // Unique entityId found
            entityId = `${entityIdBase}${counter}`; // Append counter if entityId exists
            counter++;
        }

        // Insert `entityid` in EntityMaster if it doesn’t exist
        const entitySql = `
            INSERT IGNORE INTO EntityMaster (
                entityid, entityname, namespace, masterentityid, country, contactfirstname, 
                contactlastname, email, mobile, address_line_1, address_line_2, GSTIN, Region
            ) VALUES (?, ?, ?, '1111', ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL)`;
        
        const namespace = `gsai.greentek.${entityName.toLowerCase().replace(/\s+/g, '')}`;
        const entityValues = [
            entityId, entityName, namespace, country, firstName, lastName, email, mobileNumber
        ];

        await connection.query(entitySql, entityValues);
        
        // Commit the insertion of EntityMaster to make `entityid` available for `gsai_user`
        await connection.commit();
        console.log("Debug: EntityMaster insertion committed for entityId:", entityId);

        // Disable foreign key checks temporarily
        await connection.query('SET FOREIGN_KEY_CHECKS=0');

        // Now begin a new transaction for gsai_user
        await connection.beginTransaction();

        // Generate UUID for user_id
        const userId = uuidv4();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const otpStatusValue = otp_status === true ? 1 : 0;

        // Insert user data into gsai_user with generated entityId as foreign key
        const userSql = `
            INSERT INTO gsai_user (user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number, pin_code, country, entity_name, user_role, otp_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sysadmin', ?)`;

        const userValues = [userId, entityId, firstName, lastName, email, hashedPassword, mobileNumber, pinCode, country, entityName, otpStatusValue];
        const [userResult] = await connection.query(userSql, userValues);

        if (userResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json({ message: 'Failed to insert user in gsai_user.' });
        }

        // Commit the transaction for gsai_user
        await connection.commit();

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS=1');

        res.status(201).json({ message: 'User and Entity registered successfully!', entityId });

    } catch (error) {
        await connection.rollback(); // Rollback the transaction in case of error
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error', error });
    } finally {
        connection.release(); // Release the connection back to the pool
    }
});

module.exports = router;

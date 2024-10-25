const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');  // Import the UUID generator
const pool = require('../db');  // Import the DB connection
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, mobileNumber, pinCode, country, entityName, userRole, otp_status } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName || !mobileNumber || !userRole || otp_status === undefined) {
        return res.status(400).json({ message: 'All required fields, including otp_status, must be filled!' });
    }

    try {
        // Check if a user with the same email already exists
        const [existingUser] = await pool.query('SELECT email FROM gsai_user WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'User already registered with this email.' });
        }

        // Generate UUIDs for both user_id and company_id
        const userId = uuidv4();
        const companyId = uuidv4();  // Generating a new company ID

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

        // Set otp_status field value to 1 if true, otherwise keep the original value
        const otpStatusValue = otp_status === true ? 1 : 0;

        // SQL Query to insert user data into the database, including the user_id and company_id
        const sql = `
            INSERT INTO gsai_user (user_id, company_id, first_name, last_name, email, passwordhashcode, mobile_number, pin_code, country, entity_name, user_role, otp_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [userId, companyId, firstName, lastName, email, hashedPassword, mobileNumber, pinCode, country, entityName, userRole, otpStatusValue];

        await pool.query(sql, values);
        res.status(201).json({ message: 'User registered successfully!' });
        
    } catch (error) {
        // Handle duplicate entry errors specifically
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'User already registered with this email.' });
        }

        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;

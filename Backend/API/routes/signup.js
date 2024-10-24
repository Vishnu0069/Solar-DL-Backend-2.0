const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');  // Import the DB connection
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, mobileNumber, pinCode, country, entityName, userRole } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName || !mobileNumber || !userRole) {
        return res.status(400).json({ message: 'All required fields must be filled!' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

        // SQL Query to insert user data into the database with otp_status default to false
        const sql = `
            INSERT INTO gsai_user (first_name, last_name, email, password, mobile_number, pin_code, country, entity_name, user_role, otp_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [firstName, lastName, email, hashedPassword, mobileNumber, pinCode, country, entityName, userRole, false];

        await pool.query(sql, values);
        res.status(201).json({ message: 'User registered successfully!' });
        
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;

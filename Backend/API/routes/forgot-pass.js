const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');  // Import the DB connection
const router = express.Router();

router.post('/', async (req, res) => {
    const { email, newPassword } = req.body;

    // Input validation
    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required.' });
    }

    try {
        // Check if the user with the given email exists
        const [user] = await pool.query('SELECT user_id FROM gsai_user WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'No user found with this email.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 salt rounds

        // Update the user's password in the database
        const sql = 'UPDATE gsai_user SET passwordhashcode = ? WHERE email = ?';
        await pool.query(sql, [hashedPassword, email]);

        res.status(200).json({ message: 'Password updated successfully!' });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;

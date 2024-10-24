const express = require('express');
const pool = require('../db/index');
const router = express.Router();
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

router.post('/', async (req, res) => {
  const { user_email, otp } = req.body;

  if (!user_email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const query = `SELECT otp, otp_expiry FROM user_otps WHERE user_email = ? ORDER BY created_at DESC LIMIT 1`;

  try {
    const [results] = await pool.query(query, [user_email]);

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    const userOtp = results[0];

    // Check if the OTP is correct and has not expired
    if (userOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date(userOtp.otp_expiry) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // OTP is valid and not expired
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Error fetching OTP:', err);
    res.status(500).json({ message: 'Error fetching OTP' });
  }
});

module.exports = router;

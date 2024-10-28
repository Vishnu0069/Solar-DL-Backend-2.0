// In routes/Entity/checkEmail.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

router.post('/checkEmail', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const [rows] = await pool.query('SELECT email FROM gsai_user WHERE email = ?', [email]);

    if (rows.length > 0) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ message: 'Error checking email', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const pool = require('../../db');
const router = express.Router();
require('dotenv').config();

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
      user: 'team.solardl@antsai.in',
    pass: 'TEamSOlarDL12301#'
  }
});

router.post('/add_user1', async (req, res) => {
  const {
    firstName,
    lastName,
    emailId,
    mobileNo,
    role,
    entityId
  } = req.body;

  // Check if all required fields are provided
  if (!firstName || !lastName || !emailId || !mobileNo || !role || !entityId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the email already exists in the database
    const [existingUser] = await pool.query('SELECT * FROM gsai_user WHERE email = ?', [emailId]);

    if (existingUser.length > 0) {
      // If the email exists, return 300 status with a message
      return res.status(300).json({ message: 'User already exists' });
    }

    // Hash the default password
    const defaultPassword = "DefaultPass@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Insert the new user into the database
    await pool.query(
      `INSERT INTO gsai_user (
        user_id, entityid, first_name, last_name, email, passwordhashcode, 
        mobile_number, user_role, otp_status
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 0)`,
      [entityId, firstName, lastName, emailId, hashedPassword, mobileNo, role]
    );

    // Send email to the new user
    const mailOptions = {
      from: 'team.solardl@antsai.in',
      to: emailId,
      subject: 'New Account Created - SolarDL',
      text: `
Dear ${firstName} ${lastName},

Your account has been successfully created in the SolarDL platform.

Login Details:
- Login URL: <Your_Login_URL>
- Username: ${emailId}
- Default Password: ${defaultPassword}
- Role: ${role}

Please use the above credentials to log in. We recommend changing your password upon first login.

Best Regards,
Team GSAI`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'User added successfully and email sent' });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(400).json({ message: 'Error adding user', error: error.message });
  }
});

module.exports = router;

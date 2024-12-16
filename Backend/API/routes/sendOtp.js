// module.exports = router;
<<<<<<< HEAD
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const pool = require("../db/index");
=======
const express = require('express');
const nodemailer = require('nodemailer');
const pool = require('../db/index');
require('dotenv').config(); // Import and configure dotenv
>>>>>>> 5d26d74400099096fef1ccea8e59e047e0aebd15
const router = express.Router();

// Configure NodeMailer
const transporter = nodemailer.createTransport({
<<<<<<< HEAD
  host: process.env.SMTP_HOST, // Hostinger's SMTP server
  port: process.env.SMTP_PORT, // Port for SSL
  secure: true, // Use SSL
  auth: {
    user: process.env.OTP_SMTP_MAIL, // Your email account
    pass: process.env.OTP_SMTP_PASS, // Your email password
  },
});
=======
  host: process.env.SMTP_HOST, // SMTP host from .env
  port: Number(process.env.SMTP_PORT), // SMTP port from .env (convert to number)
  secure: process.env.SMTP_SECURE === 'true', // Secure connection boolean from .env
  auth: {
    user: process.env.SMTP_USER, // Email user from .env
    pass: process.env.SMTP_PASS, // Email password from .env
  },
});

/*const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Hostinger's SMTP server
  port: 465, // Port for SSL
  secure: true, // Use SSL
  auth: {
    user: 'otp.solardl@antsai.in', // Your email account
    pass: 'OTP@ants#123*123'  // Your email password
  }
});*/
>>>>>>> 5d26d74400099096fef1ccea8e59e047e0aebd15

// Periodically delete expired OTPs
setInterval(async () => {
  try {
    const deleteQuery = `DELETE FROM user_otps WHERE otp_expiry < NOW()`;
    const [results] = await pool.query(deleteQuery);
    // console.log(`Deleted ${results.affectedRows} expired OTP(s).`);
  } catch (err) {
    console.error("Error deleting expired OTPs:", err);
  }
}, 60 * 1000); // Run every 1 minute

router.post("/", async (req, res) => {
  const { user_email } = req.body;

  if (!user_email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Generate a 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Set OTP expiry time to 3 minutes from now
  const otp_expiry = new Date(Date.now() + 3 * 60 * 1000);

  const query = `INSERT INTO user_otps (user_email, otp, otp_expiry) VALUES (?, ?, ?)`;
  const values = [user_email, otp, otp_expiry];

  try {
    await pool.query(query, values);

    // Email options
    const mailOptions = {
      from: "otp.solardl@antsai.in",
      to: user_email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 3 minutes.`,
    };

    // Send OTP to the user's email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      }

      console.log(`OTP for ${user_email}: ${otp}`);
      res.status(200).json({ message: "OTP sent successfully" });
    });
  } catch (err) {
    console.error("Error inserting OTP:", err);
    res.status(500).json({ message: "Error inserting OTP" });
  }
});

module.exports = router;

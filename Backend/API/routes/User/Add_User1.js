// const express = require('express');
// const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const pool = require('../../db');
// const router = express.Router();
// require('dotenv').config();

// // Email configuration
// const transporter = nodemailer.createTransport({
//   host: 'smtp.hostinger.com',
//   port: 465,
//   secure: true,
//   auth: {
//       user: 'team.solardl@antsai.in',
//     pass: 'TEamSOlarDL12301#'
//   }
// });

// router.post('/add_user1', async (req, res) => {
//   const {
//     firstName,
//     lastName,
//     emailId,
//     mobileNo,
//     role,
//     entityId
//   } = req.body;

//   // Check if all required fields are provided
//   if (!firstName || !lastName || !emailId || !mobileNo || !role || !entityId) {
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   try {
//     // Check if the email already exists in the database
//     const [existingUser] = await pool.query('SELECT * FROM gsai_user WHERE email = ?', [emailId]);

//     if (existingUser.length > 0) {
//       // If the email exists, return 300 status with a message
//       return res.status(300).json({ message: 'User already exists' });
//     }

//     // Hash the default password
//     const defaultPassword = "DefaultPass@123";
//     const hashedPassword = await bcrypt.hash(defaultPassword, 10);

//     // Insert the new user into the database
//     await pool.query(
//       `INSERT INTO gsai_user (
//         user_id, entityid, first_name, last_name, email, passwordhashcode,
//         mobile_number, user_role, otp_status
//       ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 0)`,
//       [entityId, firstName, lastName, emailId, hashedPassword, mobileNo, role]
//     );

//     // Send email to the new user
//     const mailOptions = {
//       from: 'team.solardl@antsai.in',
//       to: emailId,
//       subject: 'New Account Created - SolarDL',
//       text: `
// Dear ${firstName} ${lastName},

// Your account has been successfully created in the SolarDL platform.

// Login Details:
// - Login URL: <Your_Login_URL>
// - Username: ${emailId}
// - Default Password: ${defaultPassword}
// - Role: ${role}

// Please use the above credentials to log in. We recommend changing your password upon first login.

// Best Regards,
// Team GSAI`
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: 'User added successfully and email sent' });
//   } catch (error) {
//     console.error('Error adding user:', error);
//     res.status(400).json({ message: 'Error adding user', error: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const pool = require("../../db");
const router = express.Router();
require("dotenv").config({ path: __dirname + "/.env" }); // Load environment variables from .env file

//require("dotenv").config();

// Email configuration
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Hostinger's SMTP server
  port: 465, // Explicitly parse as integer
  secure: true, // Use SSL
  auth: {
    user: "team.solardl@antsai.in", // Your email account
    pass: "TEamSOlarDL12301@", // Your email password
  },
});

/*const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Hostinger's SMTP server
  port: parseInt(process.env.SMTP_PORT), // Explicitly parse as integer
  secure: true, // Use SSL
  auth: {
    user: process.env.USER, // Your email account
    pass: process.env.PASS, // Your email password
  },
});*/

router.post("/add_user1", async (req, res) => {
  const {
    firstName,
    lastName,
    emailId,
    mobileNo,
    role,
    entityId,
    plantIds = [], // Default to an empty array if plantIds is not provided
  } = req.body;

  // Check if all required fields are provided, except plantIds which is optional
  if (!firstName || !lastName || !emailId || !mobileNo || !role || !entityId) {
    return res
      .status(400)
      .json({ message: "All fields are required except plantIds" });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if the email already exists in the database
    const [existingUser] = await connection.query(
      "SELECT * FROM gsai_user WHERE email = ?",
      [emailId]
    );

    if (existingUser.length > 0) {
      // If the email exists, return 300 status with a message
      return res.status(300).json({ message: "User already exists" });
    }
    // hash the email
    const emailToken = await bcrypt.hash(emailId, 10);
    console.log("Email token : ", emailToken);

    // Hash the default password
    const defaultPassword = "DefaultPass@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Insert the new user into the gsai_user table
    const [userResult] = await connection.query(
      `INSERT INTO gsai_user (
        user_id, entityid, first_name, last_name, email, passwordhashcode, 
        mobile_number, user_role, otp_status,token
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 0,?)`,
      [
        entityId,
        firstName,
        lastName,
        emailId,
        hashedPassword,
        mobileNo,
        role,
        emailToken,
      ]
    );

    // Retrieve the newly created user_id by fetching it from the gsai_user table
    const [newUser] = await connection.query(
      "SELECT user_id FROM gsai_user WHERE email = ?",
      [emailId]
    );
    const newUserId = newUser[0].user_id;

    // Map the new user to each plant in the plantIds array if plantIds is provided and not empty
    if (Array.isArray(plantIds) && plantIds.length > 0) {
      const plantUserInsertPromises = plantIds.map((plantId) => {
        return connection.query(
          "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)",
          [plantId, newUserId]
        );
      });

      // Wait for all plant-user mappings to be inserted
      await Promise.all(plantUserInsertPromises);
    }
    // - Default Password: ${defaultPassword}
    // Send email to the new user
    const mailOptions = {
      from: "team.solardl@antsai.in",
      to: emailId,
      subject: "New Account Created - SolarDL",
      text: `
Dear ${firstName} ${lastName},

Your account has been successfully created in the SolarDL platform.

Login Details:
- Login URL: <Your_Login_URL>
- Username: ${emailId}

- Role: ${role}

To set your password, click the link below:
https://testsolardl.antsai.in/forgotpassword/setYourPassword${emailToken}

To access your account, please login using the link below:
https://testsolardl.antsai.in/login


Please use the above credentials to log in. We recommend changing your password upon first login.

Best Regards,
Team GSAI`,
    };

    await transporter.sendMail(mailOptions);

    await connection.commit();
    res
      .status(200)
      .json({ message: "User added successfully, and email sent" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding user:", error);
    res
      .status(500)
      .json({ message: "Error adding user", error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

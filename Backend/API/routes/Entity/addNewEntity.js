// // Import necessary modules
// const express = require('express');
// const pool = require('../../db');
// const router = express.Router();

// router.post('/', async (req, res) => {
//   const {
//     entityid, entityname, category, contactfirstname, contactlastname,
//     email, mobile, country, state, district, pincode,
//     masterentityid, user_id, address_line_1 = null, address_line_2 = null,
//     GSTIN = null, Region = null
//   } = req.body;

//   const namespace = 'gsai.greentek';
//   const mark_deletion = false;
//   const creation_date = new Date();
//   const last_update_date = new Date();
//   const created_by_user_id = user_id;

//   try {
//     // Insert the new entity under the specified masterentityid
//     const [result] = await pool.query(
//       `INSERT INTO EntityMaster (
//          entityid, entityname, category, contactfirstname, contactlastname, email, mobile,
//          country, state, district, pincode, masterentityid, namespace,
//          creation_date, created_by_user_id, last_update_date, mark_deletion,
//          address_line_1, address_line_2, GSTIN, Region
//        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [entityid, entityname, category, contactfirstname, contactlastname, email, mobile,
//        country, state, district, pincode, masterentityid, namespace,
//        creation_date, created_by_user_id, last_update_date, mark_deletion,
//        address_line_1, address_line_2, GSTIN, Region]
//     );

//     res.status(201).json({ message: 'Entity added successfully', entityId: result.insertId });
//   } catch (error) {
//     console.error('Error adding entity:', error);
//     res.status(500).json({ message: 'Error adding entity', error: error.message });
//   }
// });

// module.exports = router;
// // Import necessary modules
// const express = require('express');
// const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const pool = require('../../db');
// const router = express.Router();
// require('dotenv').config();  // Load environment variables from .env file

// // // Email configuration using Hostinger's SMTP and environment variables
// // const transporter = nodemailer.createTransport({
// //     host: process.env.SMTP_HOST,
// //     port: process.env.SMTP_PORT,
// //     secure: true, // Use SSL
// //     auth: {
// //         user: process.env.SMTP_USER,
// //         pass: process.env.SMTP_PASS
// //     }
// // });
// // Email configuration using Hostinger's SMTP
// const transporter = nodemailer.createTransport({
//   host: 'smtp.hostinger.com', // Hostinger's SMTP server
//   port: 465, // Port for SSL
//   secure: true, // Use SSL
//   auth: {
//       user: 'team.solardl@antsai.in', // Your email account
//       pass: 'TEamSOlarDL12301#' // Your email password
//   }
// });
// // Rest of your router code...

// router.post('/', async (req, res) => {
//   const {
//     entityid, entityname, category, contactfirstname, contactlastname,
//     email, mobile, country, state, district, pincode,
//     masterentityid, user_id, address_line_1 = null, address_line_2 = null,
//     GSTIN = null, Region = null
//   } = req.body;

//   const namespace = 'gsai.greentek';
//   const mark_deletion = false;
//   const creation_date = new Date();
//   const last_update_date = new Date();
//   const created_by_user_id = user_id;
//   const defaultPassword = 'Defaultpas@123';

//   let connection;

//   try {
//     // Initialize and start a transaction
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Insert the new entity into EntityMaster
//     const [entityResult] = await connection.query(
//       `INSERT INTO EntityMaster (
//          entityid, entityname, category, contactfirstname, contactlastname, email, mobile,
//          country, state, district, pincode, masterentityid, namespace,
//          creation_date, created_by_user_id, last_update_date, mark_deletion,
//          address_line_1, address_line_2, GSTIN, Region
//        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [entityid, entityname, category, contactfirstname, contactlastname, email, mobile,
//        country, state, district, pincode, masterentityid, namespace,
//        creation_date, created_by_user_id, last_update_date, mark_deletion,
//        address_line_1, address_line_2, GSTIN, Region]
//     );

//     // Hash the default password
//     const hashedPassword = await bcrypt.hash(defaultPassword, 10);

//     // Insert a new user into gsai_user table
//     const [userResult] = await connection.query(
//       `INSERT INTO gsai_user (
//         user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//         pin_code, country, entity_name, user_role, otp_status
//       ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sys admin', 1)`,
//       [entityid, contactfirstname, contactlastname, email, hashedPassword, mobile, pincode, country, entityname]
//     );

//     // Commit the transaction
//     await connection.commit();

//     // Send email notification to the user
//     const mailOptions = {
//       from: 'team.solardl@antsai.in',
//       to: email,
//       subject: 'New Entity added to SolarDL',
//       text: `
// Dear ${contactfirstname} ${contactlastname},

// You have been added as Administrator to ${entityname} with EntityID: ${entityid}.

// Your Default password is ${defaultPassword}.

// Please login with the above credentials by clicking the link below:
// <Your_Login_Link_Here>

// With best regards,
// Team GSAI`
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(201).json({ message: 'Entity and user created successfully, and email sent', entityId: entityResult.insertId });

//   } catch (error) {
//     if (connection) await connection.rollback(); // Rollback on error if connection exists
//     console.error('Error adding entity and user:', error);
//     res.status(500).json({ message: 'Error adding entity and user', error: error.message });
//   } finally {
//     if (connection) connection.release(); // Release the connection back to the pool
//   }
// });

// module.exports = router;
// below is the one after the demo like dynamic entity Name ok
// // Import necessary modules
// const express = require("express");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const pool = require("../../db");
// const router = express.Router();
// require("dotenv").config(); // Load environment variables from .env file

// // Email configuration using Hostinger's SMTP
// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com", // Hostinger's SMTP server
//   port: 465, // Port for SSL
//   secure: true, // Use SSL
//   auth: {
//     user: "team.solardl@antsai.in", // Your email account
//     pass: "TEamSOlarDL12301#", // Your email password
//   },
// });

// // API to add entity and user
// router.post("/", async (req, res) => {
//   const {
//     entityname,
//     category,
//     contactfirstname,
//     contactlastname,
//     email,
//     mobile,
//     country,
//     state,
//     district,
//     pincode,
//     masterentityid,
//     user_id,
//     address_line_1 = null,
//     address_line_2 = null,
//     GSTIN = null,
//     Region = null,
//   } = req.body;

//   const namespace = "gsai.greentek";
//   const mark_deletion = false;
//   const creation_date = new Date();
//   const last_update_date = new Date();
//   const created_by_user_id = user_id;
//   const defaultPassword = "Defaultpas@123";

//   let connection;

//   try {
//     console.log("Starting the process...");
//     // Initialize and start a transaction
//     connection = await pool.getConnection();
//     await connection.beginTransaction();
//     console.log("Database connection established and transaction started.");

//     // Generate a dynamic entityid
//     let entityid = entityname.replace(/\s+/g, "").toUpperCase(); // Remove spaces and make uppercase
//     let counter = 1000;
//     let isUnique = false;

//     while (!isUnique) {
//       const [existingEntities] = await connection.query(
//         "SELECT entityid FROM EntityMaster WHERE entityid = ?",
//         [`${entityid}-${counter}`]
//       );
//       if (existingEntities.length === 0) {
//         isUnique = true;
//         entityid = `${entityid}-${counter}`;
//       } else {
//         counter++;
//       }
//     }
//     console.log(`Generated unique entity ID: ${entityid}`);

//     // Insert the new entity into EntityMaster
//     const [entityResult] = await connection.query(
//       `INSERT INTO EntityMaster (
//          entityid, entityname, category, contactfirstname, contactlastname, email, mobile,
//          country, state, district, pincode, masterentityid, namespace,
//          creation_date, created_by_user_id, last_update_date, mark_deletion,
//          address_line_1, address_line_2, GSTIN, Region
//        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         entityid,
//         entityname,
//         category,
//         contactfirstname,
//         contactlastname,
//         email,
//         mobile,
//         country,
//         state,
//         district,
//         pincode,
//         masterentityid,
//         namespace,
//         creation_date,
//         created_by_user_id,
//         last_update_date,
//         mark_deletion,
//         address_line_1,
//         address_line_2,
//         GSTIN,
//         Region,
//       ]
//     );
//     console.log("Entity inserted into EntityMaster:", entityResult);

//     // Hash the default password
//     const hashedPassword = await bcrypt.hash(defaultPassword, 10);

//     // Insert a new user into gsai_user table
//     const [userResult] = await connection.query(
//       `INSERT INTO gsai_user (
//         user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//         pin_code, country, entity_name, user_role, otp_status
//       ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sys admin', 1)`,
//       [
//         entityid,
//         contactfirstname,
//         contactlastname,
//         email,
//         hashedPassword,
//         mobile,
//         pincode,
//         country,
//         entityname,
//       ]
//     );
//     console.log("User inserted into gsai_user:", userResult);

//     // Commit the transaction
//     await connection.commit();
//     console.log("Transaction committed successfully.");

//     //     // Send email notification to the user
//     //     const mailOptions = {
//     //       from: "team.solardl@antsai.in",
//     //       to: email,
//     //       subject: "New Entity added to SolarDL",
//     //       text: `
//     // Dear ${contactfirstname} ${contactlastname},

//     // You have been added as Administrator to ${entityname} with EntityID: ${entityid}.

//     // Your Default password is ${defaultPassword}.

//     // Please login with the above credentials by clicking the link below:
//     // <Your_Login_Link_Here>

//     // With best regards,
//     // Team GSAI`,
//     //     };

//     // Send email notification to the user
//     const mailOptions = {
//       from: "team.solardl@antsai.in",
//       to: email,
//       subject: "New Entity added to SolarDL",
//       text: `
// Dear ${contactfirstname} ${contactlastname},

// You have been added as Administrator to ${entityname} with the following details:

// Entity ID: ${entityid}

// To set your password, click the link below:
// https://testsolardl.antsai.in/forgotpassword/setYourPassword

// To access your account, please login using the link below:
// https://testsolardl.antsai.in/login

// With best regards,
// Team GSAI`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully.");

//     await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully.");

//     res.status(201).json({
//       message: "Entity and user created successfully, and email sent",
//       entityId: entityid,
//     });
//   } catch (error) {
//     if (connection) await connection.rollback(); // Rollback on error if connection exists
//     console.error("Error adding entity and user:", error);
//     res
//       .status(500)
//       .json({ message: "Error adding entity and user", error: error.message });
//   } finally {
//     if (connection) connection.release(); // Release the connection back to the pool
//     console.log("Database connection released.");
//   }
// });

// module.exports = router;

// todo
//expiry date and device count added
// const express = require("express");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const pool = require("../../db");
// const router = express.Router();
// require("dotenv").config(); // Load environment variables from .env file

// // Email configuration using Hostinger's SMTP
// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com", // Hostinger's SMTP server
//   port: 465, // Port for SSL
//   secure: true, // Use SSL
//   auth: {
//     user: "team.solardl@antsai.in", // Your email account
//     pass: "TEamSOlarDL12301#", // Your email password
//   },
// });

// API to add entity and user
// router.post("/", async (req, res) => {
//   const {
//     entityname,
//     category,
//     contactfirstname,
//     contactlastname,
//     email,
//     mobile,
//     country,
//     state,
//     district,
//     pincode,
//     masterentityid,
//     user_id,
//     address_line_1 = null,
//     address_line_2 = null,
//     GSTIN = null,
//     Region = null,
//     expiryDate = null, // Default empty string from frontend
//     deviceCount = null, // Default empty string from frontend
//   } = req.body;

//   const namespace = "gsai.greentek";
//   const mark_deletion = false;
//   const creation_date = new Date();
//   const last_update_date = new Date();
//   const created_by_user_id = user_id;

//   let connection;

//   try {
//     console.log("Starting the process...");
//     // Initialize and start a transaction
//     connection = await pool.getConnection();
//     await connection.beginTransaction();
//     console.log("Database connection established and transaction started.");

//     // Generate a dynamic entityid
//     let entityid = entityname.replace(/\s+/g, "").toUpperCase(); // Remove spaces and make uppercase
//     let counter = 1000;
//     let isUnique = false;

//     while (!isUnique) {
//       const [existingEntities] = await connection.query(
//         "SELECT entityid FROM EntityMaster WHERE entityid = ?",
//         [`${entityid}-${counter}`]
//       );
//       if (existingEntities.length === 0) {
//         isUnique = true;
//         entityid = `${entityid}-${counter}`;
//       } else {
//         counter++;
//       }
//     }
//     console.log(`Generated unique entity ID: ${entityid}`);

//     // Insert the new entity into EntityMaster
//     const [entityResult] = await connection.query(
//       `INSERT INTO EntityMaster (
//          entityid, entityname, category, contactfirstname, contactlastname, email, mobile,
//          country, state, district, pincode, masterentityid, namespace,
//          creation_date, created_by_user_id, last_update_date, mark_deletion,
//          address_line_1, address_line_2, GSTIN, Region, device_count, expiry_date
//        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

//       [
//         entityid,
//         entityname,
//         category,
//         contactfirstname,
//         contactlastname,
//         email,
//         mobile,
//         country,
//         state,
//         district,
//         pincode,
//         masterentityid,
//         namespace,
//         creation_date,
//         created_by_user_id,
//         last_update_date,
//         mark_deletion,
//         address_line_1,
//         address_line_2,
//         GSTIN,
//         Region,
//         deviceCount,
//         expiryDate,
//       ]
//     );
//     console.log("Entity inserted into EntityMaster:", entityResult);

//     // Hash the default password
//     const hashedPassword = await bcrypt.hash("Defaultpas@123", 10);

//     // Insert a new user into gsai_user table
//     const [userResult] = await connection.query(
//       `INSERT INTO gsai_user (
//         user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//         pin_code, country, entity_name, user_role, otp_status
//       ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sys admin', 1)`,
//       [
//         entityid,
//         contactfirstname,
//         contactlastname,
//         email,
//         hashedPassword,
//         mobile,
//         pincode,
//         country,
//         entityname,
//       ]
//     );
//     console.log("User inserted into gsai_user:", userResult);

//     // Commit the transaction
//     await connection.commit();
//     console.log("Transaction committed successfully.");

//     // Send email notification to the user
//     const mailOptions = {
//       from: "team.solardl@antsai.in",
//       to: email,
//       subject: "New Entity added to SolarDL",
//       text: `
// Dear ${contactfirstname} ${contactlastname},

// You have been added as Administrator to ${entityname} with the following details:

// Entity ID: ${entityid}

// To set your password, click the link below:
// https://testsolardl.antsai.in/forgotpassword/setYourPassword

// To access your account, please login using the link below:
// https://testsolardl.antsai.in/login

// With best regards,
// Team GSAI`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully.");

//     res.status(201).json({
//       message: "Entity and user created successfully, and email sent",
//       entityId: entityid,
//     });
//   } catch (error) {
//     if (connection) await connection.rollback(); // Rollback on error if connection exists
//     console.error("Error adding entity and user:", error);
//     res
//       .status(500)
//       .json({ message: "Error adding entity and user", error: error.message });
//   } finally {
//     if (connection) connection.release(); // Release the connection back to the pool
//     console.log("Database connection released.");
//   }
// });

// module.exports = router;

// todo new code  (module 5) 5/12/24
// todo  (hashed the user_email and saved to database)

// const bcrypt = require("bcrypt"); // Ensure bcrypt is imported

const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const pool = require("../../db");
const router = express.Router();
require("dotenv").config(); // Load environment variables from .env file

// Email configuration using Hostinger's SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Hostinger's SMTP server
  port: 465, // Port for SSL
  secure: true, // Use SSL
  auth: {
    user: "team.solardl@antsai.in", // Your email account
    pass: "TEamSOlarDL12301#", // Your email password
  },
});

router.post("/", async (req, res) => {
  const {
    entityname,
    category,
    contactfirstname,
    contactlastname,
    email,
    mobile,
    country,
    state,
    district,
    pincode,
    masterentityid,
    user_id,
    address_line_1 = null,
    address_line_2 = null,
    GSTIN = null,
    Region = null,
    expiryDate = null,
    deviceCount = null,
  } = req.body;

  const namespace = "gsai.greentek";
  const mark_deletion = false;
  const creation_date = new Date();
  const last_update_date = new Date();
  const created_by_user_id = user_id;

  let connection;

  try {
    console.log("Starting the process...");
    connection = await pool.getConnection();
    await connection.beginTransaction();
    console.log("Database connection established and transaction started.");

    // Generate a dynamic entityid
    let entityid = entityname.replace(/\s+/g, "").toUpperCase();
    let counter = 1000;
    let isUnique = false;

    while (!isUnique) {
      const [existingEntities] = await connection.query(
        "SELECT entityid FROM EntityMaster WHERE entityid = ?",
        [`${entityid}-${counter}`]
      );
      if (existingEntities.length === 0) {
        isUnique = true;
        entityid = `${entityid}-${counter}`;
      } else {
        counter++;
      }
    }
    console.log(`Generated unique entity ID: ${entityid}`);

    // Insert the new entity into EntityMaster
    const [entityResult] = await connection.query(
      `INSERT INTO EntityMaster (
         entityid, entityname, category, contactfirstname, contactlastname, email, mobile, 
         country, state, district, pincode, masterentityid, namespace, 
         creation_date, created_by_user_id, last_update_date, mark_deletion, 
         address_line_1, address_line_2, GSTIN, Region, device_count, expiry_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        entityid,
        entityname,
        category,
        contactfirstname,
        contactlastname,
        email,
        mobile,
        country,
        state,
        district,
        pincode,
        masterentityid,
        namespace,
        creation_date,
        created_by_user_id,
        last_update_date,
        mark_deletion,
        address_line_1,
        address_line_2,
        GSTIN,
        Region,
        deviceCount,
        expiryDate,
      ]
    );
    console.log("Entity inserted into EntityMaster:", entityResult);

    // Hash the default password
    const hashedPassword = await bcrypt.hash("Defaultpas@123", 10);

    // Hash the user's email for the password reset link
    const emailToken = await bcrypt.hash(email, 10);
    console.log("Email token : ", emailToken);

    // Insert a new user into gsai_user table
    const [userResult] = await connection.query(
      `INSERT INTO gsai_user (
        user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number, 
        pin_code, country, entity_name, user_role, otp_status,token
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sys admin', 1,?)`,
      [
        entityid,
        contactfirstname,
        contactlastname,
        email,
        hashedPassword,
        mobile,
        pincode,
        country,
        entityname,
        emailToken,
      ]
    );
    console.log("User  inserted into gsai_user:", userResult);

    // Commit the transaction
    await connection.commit();
    console.log("Transaction committed successfully.");

    // Hash the user's email for the password reset link

    // Send email notification to the user
    const mailOptions = {
      from: "team.solardl@antsai.in",
      to: email,
      subject: "New Entity added to SolarDL",
      text: `
Dear ${contactfirstname} ${contactlastname},

You have been added as Administrator to ${entityname} with the following details:

Entity ID: ${entityid}

To set your password, click the link below:
https://testsolardl.antsai.in/forgotpassword/setYourPassword?${emailToken}

To access your account, please login using the link below:
https://testsolardl.antsai.in/login

With best regards,
Team GSAI`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");

    res.status(201).json({
      message: "Entity and user created successfully, and email sent",
      entityId: entityid,
    });
  } catch (error) {
    if (connection) await connection.rollback(); // Rollback on error if connection exists
    console.error("Error adding entity and user:", error);
    res
      .status(500)
      .json({ message: "Error adding entity and user", error: error.message });
  } finally {
    if (connection) connection.release(); // Release the connection back to the pool
    console.log("Database connection released.");
  }
});

module.exports = router;

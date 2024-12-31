// // In routes/Entity/editEntity.js
// const express = require('express');
// const pool = require('../../db');
// const router = express.Router();

// router.put('/edit', async (req, res) => {
//   const {
//     entityid, entityname, category, contactfirstname, contactlastname,
//     email, mobile, country, state, district, pincode,
//     address_line_1 = null, address_line_2 = null, GSTIN = null, Region = null, disable = 0
//   } = req.body;

//   if (!entityid) {
//     return res.status(400).json({ message: 'Entity ID is required' });
//   }

//   try {
//     // Base update query
//     let updateQuery = `
//       UPDATE EntityMaster
//       SET
//         entityname = ?, category = ?, contactfirstname = ?, contactlastname = ?,
//         email = ?, mobile = ?, country = ?, state = ?, district = ?,
//         pincode = ?, address_line_1 = ?, address_line_2 = ?, GSTIN = ?, Region = ?
//     `;

//     // Include mark_deletion update if disable is set to 1
//     const updateValues = [
//       entityname, category, contactfirstname, contactlastname, email, mobile,
//       country, state, district,  pincode, address_line_1, address_line_2, GSTIN, Region
//     ];

//     if (disable === 1) {
//       updateQuery += `, mark_deletion = ?`;
//       updateValues.push(1);
//     }

//     updateQuery += ` WHERE entityid = ?`;
//     updateValues.push(entityid);

//     // Execute update query
//     const [result] = await pool.query(updateQuery, updateValues);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Entity not found' });
//     }

//     res.status(200).json({ message: 'Entity updated successfully' });
//   } catch (error) {
//     console.error('Error updating entity:', error);
//     res.status(500).json({ message: 'Error updating entity', error: error.message });
//   }
// });

// module.exports = router;

//editEntity for exp_date and device_count

// const express = require("express");
// const pool = require("../../db");
// const nodemailer = require("nodemailer");
// const router = express.Router();
// const bcrypt = require("bcrypt");

// //  Email configuration using Hostinger's SMTP

// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com", // Hostinger's SMTP server
//   port: 465, // Port for SSL
//   secure: true, // Use SSL
//   auth: {
//     user: "team.solardl@antsai.in", // Your email account
//     pass: "TEamSOlarDL12301@", // Your email password
//   },
// });

// router.put("/edit", async (req, res) => {
//   const {
//     entityid,
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
//     address_line_1 = null,
//     address_line_2 = null,
//     GSTIN = null,
//     Region = null,
//     deviceCount = null,
//     expiryDate = null,
//     disable = 0, // Default is not disabled
//   } = req.body;

//   if (!entityid) {
//     return res.status(400).json({ message: "Entity ID is required" });
//   }

//   //todo   user should be in enable to edit so " 0 "
//   // const mark_deletion = 0
//   const emailToken = bcrypt.hash(email, 10);
//   console.log(email_token);

//   try {
//     // Parse expiryDate and deviceCount
//     const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;
//     const parsedDeviceCount = deviceCount ? parseInt(deviceCount, 10) : null;

//     // Base update query
//     let updateQuery = `
//       UPDATE EntityMaster
//       SET
//         entityname = ?,
//         category = ?,
//         contactfirstname = ?,
//         contactlastname = ?,
//         email = ?,
//         mobile = ?,
//         country = ?,
//         state = ?,
//         district = ?,
//         pincode = ?,
//         address_line_1 = ?,
//         address_line_2 = ?,
//         GSTIN = ?,
//         Region = ?,
//         device_count = ?,
//         expiry_date = ?
//     `;

//     // Include mark_deletion update if disable is set to 1
//     const updateValues = [
//       entityname,
//       category,
//       contactfirstname,
//       contactlastname,
//       email,
//       mobile,
//       country,
//       state,
//       district,
//       pincode,
//       address_line_1,
//       address_line_2,
//       GSTIN,
//       Region,
//       parsedDeviceCount,
//       parsedExpiryDate,
//     ];

//     if (disable === 1) {
//       updateQuery += `, mark_deletion = ?`;
//       updateValues.push(1);
//     }

//     updateQuery += ` WHERE entityid = ?`;
//     updateValues.push(entityid);

//     // Execute update query
//     const [result] = await pool.query(updateQuery, updateValues);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Entity not found" });
//     }

//     const [entityUpdate] = await pool.query(
//       "SELECT * FROM EntityMaster  WHERE entityid=?",
//       [entityid]
//     );

//     const mailOptions = {
//       from: "team.solardl@antsai.in",
//       to: email,
//       subject: "New Entity added to SolarDL",
//       text: `
// Dear ${contactfirstname} ${contactlastname},

// Your enitity to ${entityname} has updated successfully with the following details:

// Entity ID: ${entityid}

// Please reset the password to login you account
// To set your password, click the link below:
// https://testsolardl.antsai.in/forgotpassword/setYourPassword?${emailToken}

// To access your account, please login using the link below:
// https://testsolardl.antsai.in/login

// With best regards,
// Team GSAI`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully.");

//     res.status(200).json({
//       message: "Entity updated successfully",
//       entityUpdate: entityUpdate,
//     });
//   } catch (error) {
//     console.error("Error updating entity:", error);
//     res
//       .status(500)
//       .json({ message: "Error updating entity", error: error.message });
//   }
// });

// module.exports = router;

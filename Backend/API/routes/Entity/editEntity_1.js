// const express = require("express");
// const pool = require("../../db");
// const nodemailer = require("nodemailer");
// const bcrypt = require("bcrypt");
// const router = express.Router();

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
//   } = req.body;

//   if (!entityid) {
//     return res.status(400).json({ message: "Entity ID is required" });
//   }

//   // Hash the email for password reset if needed
//   const emailToken = await bcrypt.hash(email, 10);
//   console.log(`Email Token: ${emailToken}`);

//   let connection;

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();
//     console.log("Database connection established and transaction started.");

//     const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;
//     const parsedDeviceCount = deviceCount ? parseInt(deviceCount, 10) : null;

//     // Check if the email has changed
//     const [existingEntity] = await connection.query(
//       "SELECT email FROM EntityMaster WHERE entityid = ?",
//       [entityid]
//     );

//     const oldEmail = existingEntity.length > 0 ? existingEntity[0].email : null;
//     const emailChanged = oldEmail !== email;

//     // Update EntityMaster and gsai_user based on whether the email has changed
//     const updateQuery = `
//         UPDATE EntityMaster
//         SET
//           entityname = ?,
//           category = ?,
//           contactfirstname = ?,
//           contactlastname = ?,
//           email = ?,
//           mobile = ?,
//           country = ?,
//           state = ?,
//           district = ?,
//           pincode = ?,
//           address_line_1 = ?,
//           address_line_2 = ?,
//           GSTIN = ?,
//           Region = ?,
//           device_count = ?,
//           expiry_date = ?,
//           mark_deletion = 1,
//           token = ?
//         WHERE entityid = ?
//       `;

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
//       emailToken,
//       entityid,
//     ];

//     const [result] = await connection.query(updateQuery, updateValues);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Entity not found" });
//     }

//     // Update gsai_user table with all relevant fields
//     await connection.query(
//       `UPDATE gsai_user
//         SET
//           email = ?,
//           first_name = ?,
//           last_name = ?,
//           mobile_number = ?,
//           pin_code = ?,
//           country = ?,
//           entity_name = ?,
//           token = ?,
//           delete_flag = 1
//         WHERE entityid = ?`,
//       [
//         email,
//         contactfirstname,
//         contactlastname,
//         mobile,
//         pincode,
//         country,
//         entityname,
//         emailToken,
//         entityid,
//       ]
//     );
//     console.log("Updated gsai_user with new values");

//     // Commit the transaction
//     await connection.commit();
//     console.log("Transaction committed successfully.");

//     // Send password reset email to the current or updated email
//     const mailOptions = {
//       from: "team.solardl@antsai.in",
//       to: email,
//       subject: "Your Entity Details Have Been Updated",
//       text: `Dear ${contactfirstname} ${contactlastname},

//   Your entity details have been successfully updated. Please reset your password to login to your account.

//   To set your password, click the link below:
//   https://testsolardl.antsai.in/forgotpassword/setYourPassword?${emailToken}

//   To access your account, please login using the link below:
//   https://testsolardl.antsai.in/login

//   Best regards,
//   Team GSAI
//         `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Password reset email sent successfully.");

//     // Fetch updated entity and user
//     const [entityUpdate] = await connection.query(
//       "SELECT * FROM EntityMaster WHERE entityid = ?",
//       [entityid]
//     );

//     const [userUpdate] = await connection.query(
//       "SELECT * FROM gsai_user WHERE entityid = ?",
//       [entityid]
//     );

//     res.status(200).json({
//       message: "Entity updated successfully",
//       entityUpdate,
//       userUpdate,
//     });
//   } catch (error) {
//     if (connection) await connection.rollback(); // Rollback on error
//     console.error("Error updating entity:", error);
//     res
//       .status(500)
//       .json({ message: "Error updating entity", error: error.message });
//   } finally {
//     if (connection) connection.release(); // Release connection back to the pool
//     console.log("Database connection released.");
//   }
// });

// module.exports = router;

// todo
const express = require("express");
const pool = require("../../db");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const router = express.Router();
const auth = require("../../middleware/auth");

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Hostinger's SMTP server
  port: 465, // Port for SSL
  secure: true, // Use SSL
  auth: {
    user: "team.solardl@antsai.in", // Your email account
    pass: "TEamSOlarDL12301@", // Your email password
  },
});

router.put("/edit", auth, async (req, res) => {
  const {
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
    address_line_1 = null,
    address_line_2 = null,
    GSTIN = null,
    Region = null,
    deviceCount = null,
    expiryDate = null,
  } = req.body;

  if (!entityid) {
    return res.status(400).json({ message: "Entity ID is required" });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;
    const parsedDeviceCount = deviceCount ? parseInt(deviceCount, 10) : null;

    // Fetch the current email from the database
    const [existingEntity] = await connection.query(
      "SELECT email FROM EntityMaster WHERE entityid = ?",
      [entityid]
    );

    const oldEmail = existingEntity.length > 0 ? existingEntity[0].email : null;
    const emailChanged = oldEmail !== email;

    if (emailChanged) {
      // If email has changed, generate a token and update with deletion flags
      const emailToken = await bcrypt.hash(email, 10);

      // Update EntityMaster with deletion flags and new email
      await connection.query(
        `
          UPDATE EntityMaster 
          SET 
            entityname = ?, 
            category = ?, 
            contactfirstname = ?, 
            contactlastname = ?, 
            email = ?, 
            mobile = ?, 
            country = ?, 
            state = ?, 
            district = ?,  
            pincode = ?, 
            address_line_1 = ?, 
            address_line_2 = ?, 
            GSTIN = ?, 
            Region = ?, 
            device_count = ?, 
            expiry_date = ?, 
            mark_deletion = 1,
            token = ?
          WHERE entityid = ?
        `,
        [
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
          address_line_1,
          address_line_2,
          GSTIN,
          Region,
          parsedDeviceCount,
          parsedExpiryDate,
          emailToken,
          entityid,
        ]
      );

      // Update gsai_user with deletion flag and new email
      await connection.query(
        `
          UPDATE gsai_user 
          SET 
            email = ?, 
            first_name = ?, 
            last_name = ?, 
            mobile_number = ?, 
            pin_code = ?, 
            country = ?, 
            entity_name = ?, 
            token = ?, 
            delete_flag = 1 
          WHERE entityid = ?
        `,
        [
          email,
          contactfirstname,
          contactlastname,
          mobile,
          pincode,
          country,
          entityname,
          emailToken,
          entityid,
        ]
      );

      // Send email notification
      const mailOptions = {
        from: "team.solardl@antsai.in",
        to: email,
        subject: "Your Entity Details Have Been Updated",
        text: `Dear ${contactfirstname} ${contactlastname},
Your entity details have been successfully updated. Please reset your password to login to your account.

To set your password, click the link below:
https://testsolardl.antsai.in/forgotpassword/setYourPassword?${emailToken}

To access your account, please login using the link below:
https://testsolardl.antsai.in/login

Best regards,
Team GSAI
        `,
      };

      await transporter.sendMail(mailOptions);
    } else {
      // If email hasn't changed, update other fields without setting deletion flags
      await connection.query(
        `
          UPDATE EntityMaster 
          SET 
            entityname = ?, 
            category = ?, 
            contactfirstname = ?, 
            contactlastname = ?, 
            mobile = ?, 
            country = ?, 
            state = ?, 
            district = ?,  
            pincode = ?, 
            address_line_1 = ?, 
            address_line_2 = ?, 
            GSTIN = ?, 
            Region = ?, 
            device_count = ?, 
            expiry_date = ?
          WHERE entityid = ?
        `,
        [
          entityname,
          category,
          contactfirstname,
          contactlastname,
          mobile,
          country,
          state,
          district,
          pincode,
          address_line_1,
          address_line_2,
          GSTIN,
          Region,
          parsedDeviceCount,
          parsedExpiryDate,
          entityid,
        ]
      );

      await connection.query(
        `
          UPDATE gsai_user 
          SET 
            first_name = ?, 
            last_name = ?, 
            mobile_number = ?, 
            pin_code = ?, 
            country = ?, 
            entity_name = ?
          WHERE entityid = ?
        `,
        [
          contactfirstname,
          contactlastname,
          mobile,
          pincode,
          country,
          entityname,
          entityid,
        ]
      );
    }

    // Commit the transaction
    await connection.commit();

    res.status(200).json({
      message: "Entity updated successfully",
      emailChanged,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error updating entity:", error);
    res
      .status(500)
      .json({ message: "Error updating entity", error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

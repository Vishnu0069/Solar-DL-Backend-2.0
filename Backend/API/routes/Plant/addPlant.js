// const express = require('express');
// const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const { v4: uuidv4 } = require('uuid'); // Import the UUID generator
// const pool = require('../../db');
// const router = express.Router();
// require('dotenv').config();

// // Email configuration
// const transporter = nodemailer.createTransport({
//   host: 'smtp.hostinger.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: 'team.solardl@antsai.in',
//     pass: 'TEamSOlarDL12301#'
//   }
// });

// router.post('/addPlant', async (req, res) => {
//   const {
//     plant_id,
//     entityid,
//     plant_name,
//     install_date,
//     azimuth_angle,
//     tilt_angle,
//     plant_type,
//     plant_category,
//     capacity,
//     capacity_unit,
//     country,
//     region,
//     state,
//     district,
//     address_line1,
//     address_line2,
//     pincode,
//     longitude,
//     latitude,
//     data_logger,
//     inverter,
//     owner_first_name,
//     owner_last_name,
//     owner_email,
//     mobile_number = null
//   } = req.body;

//   if (!plant_id) {
//     return res.status(400).json({ message: 'plant_id is required.' });
//   }

//   let connection;

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Step 1: Insert plant details into Gsai_PlantMaster
//     await connection.query(
//       `INSERT INTO Gsai_PlantMaster (
//         plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
//         plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
//         address_line2, pincode, longitude, latitude, data_logger, inverter, owner_first_name,
//         owner_last_name, owner_email
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
//       [
//         plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
//         plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
//         address_line2, pincode, longitude, latitude, data_logger, inverter, owner_first_name,
//         owner_last_name, owner_email
//       ]
//     );

//     let newEntityId = entityid;
//     let suffix = 1001;

//     // Step 2: If plant type is "Individual", create a new user with a unique entityid and UUID user_id
//     if (plant_type.toLowerCase() === "individual") {
//       const baseEntityId = entityid.split('-')[0];

//       // Generate a unique `entityid`
//       while (true) {
//         newEntityId = `${baseEntityId}-${suffix}`;
//         const [existingEntity] = await connection.query(
//           'SELECT entityid FROM EntityMaster WHERE entityid = ?',
//           [newEntityId]
//         );
//         if (existingEntity.length === 0) break;
//         suffix += 1;
//       }

//       // Insert into EntityMaster
//       await connection.query(
//         `INSERT INTO EntityMaster (
//           entityid, entityname, category, contactfirstname, contactlastname, email, mobile,
//           country, state, district, pincode, namespace, creation_date, last_update_date, mark_deletion
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'gsai.greentek', NOW(), NOW(), 0)`,
//         [newEntityId, plant_name, plant_category, owner_first_name, owner_last_name, owner_email, mobile_number, country, state, district, pincode]
//       );

//       // Generate a new UUID for user_id
//       const newUserId = uuidv4();

//       // Hash the default password
//       const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);

//       // Insert the new user with generated user_id and entityid in gsai_user
//       await connection.query(
//         `INSERT INTO gsai_user (
//           user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//           pin_code, country, entity_name, user_role, otp_status
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 1)`,
//         [
//           newUserId, newEntityId, owner_first_name, owner_last_name, owner_email, hashedPassword,
//           mobile_number || '0000000000', pincode, country, plant_name
//         ]
//       );

//       // Link plant and user in Gsai_PlantUser with the new UUID user_id
//       await connection.query(
//         'INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)',
//         [plant_id, newUserId]
//       );

//       // Send email notification
//       const mailOptions = {
//         from: 'team.solardl@antsai.in',
//         to: owner_email,
//         subject: 'New Individual User Created for Plant',
//         text: `
// Dear ${owner_first_name} ${owner_last_name},

// You have been added as an individual user for the plant ${plant_name} with EntityID: ${newEntityId}.

// Your default password is DefaultPass@123.

// Please log in with the above credentials.

// Best regards,
// Team GSAI`
//       };
//       await transporter.sendMail(mailOptions);
//     } else {
//       // Fetch sysadmin user_id for other plant types
//       const [sysadminUser] = await connection.query('SELECT user_id FROM gsai_user WHERE entityid = ?', [entityid]);
//       if (sysadminUser.length === 0) {
//         return res.status(404).json({ message: 'Sysadmin user not found for the given entity ID.' });
//       }
//       const sysadminUserId = sysadminUser[0].user_id;

//       // Link sysadmin to the plant
//       await connection.query(
//         'INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)',
//         [plant_id, sysadminUserId]
//       );
//     }

//     await connection.commit();
//     res.status(201).json({ message: 'Plant and user linked successfully', plant_id });
//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error('Error adding plant:', error);
//     res.status(500).json({ message: 'Error adding plant', error: error.message });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// module.exports = router;

const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid"); // Import the UUID generator
const pool = require("../../db");
const router = express.Router();

require("dotenv").config({ path: __dirname + "/.env" });

// // Email configuration
// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "team.solardl@antsai.in",
//     pass: "TEamSOlarDL12301#",
//   },
// });

// Email configuration using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post("/addPlant", async (req, res) => {
  const {
    plant_id,
    entityid,
    plant_name,
    install_date,
    azimuth_angle,
    tilt_angle,
    plant_type,
    plant_category,
    capacity,
    capacity_unit,
    country,
    region,
    state,
    district,
    address_line1,
    address_line2,
    pincode,
    longitude,
    latitude,
    data_logger,
    inverter,
    owner_first_name,
    owner_last_name,
    owner_email,
    mobileNumber = null,
    email_status = null, // New field with default null
    mail = null, // New field with default null
    entityname,
  } = req.body;

  if (!plant_id) {
    return res.status(400).json({ message: "plant_id is required." });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    console.log("Starting transaction for adding plant...");

    // Log email_status and mail to the console
    console.log(`email_status: ${email_status}, mail: ${mail}`);

    // Step 1: Insert plant details into Gsai_PlantMaster
    console.log("Inserting plant details into Gsai_PlantMaster...");
    await connection.query(
      `INSERT INTO Gsai_PlantMaster (
        plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type, 
        plant_category, capacity, capacity_unit, country, region, state, district, address_line1, 
        address_line2, pincode, longitude, latitude, data_logger, inverter, owner_first_name, 
        owner_last_name, owner_email,mobileno,entityname
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? );`,
      [
        plant_id,
        entityid,
        plant_name,
        install_date,
        azimuth_angle,
        tilt_angle,
        plant_type,
        plant_category,
        capacity,
        capacity_unit,
        country,
        region,
        state,
        district,
        address_line1,
        address_line2,
        pincode,
        longitude,
        latitude,
        data_logger,
        inverter,
        owner_first_name,
        owner_last_name,
        owner_email,
        mobileNumber,
        entityname,
      ]
    );

    if (plant_type.toLowerCase() === "individual") {
      console.log(
        "Plant type is individual. Creating a new user with role 'individual'..."
      );
      // Step 2: Create a new individual user linked to the plant
      const newUserId = uuidv4();
      const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);

      // hashing the email
      const emailToken = await bcrypt.hash(owner_email, 10);

      // Insert the new user with role 'individual'
      console.log(
        "Inserting new individual user into gsai_user with ID:",
        newUserId
      );
      await connection.query(
        `INSERT INTO gsai_user (
          user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number, 
          pin_code, country, entity_name, user_role, otp_status,token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 1,?)`,
        [
          newUserId,
          entityid,
          owner_first_name,
          owner_last_name,
          owner_email,
          hashedPassword,
          mobileNumber || "0000000000", // todo mobileNumber || "0000000000",
          pincode,
          country,
          plant_name,
          emailToken,
        ]
      );

      console.log("Linking the new user to the plant in Gsai_PlantUser...");
      // Link the individual user to the plant in Gsai_PlantUser
      await connection.query(
        "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)",
        [plant_id, newUserId]
      );

      console.log("Sending email notification to the new individual user...");
      // Send email notification to the new individual user
      await transporter.sendMail({
        //from: "team.solardl@antsai.in",
        from: process.env.SMTP_USER,
        to: owner_email,
        subject: "New Individual User Created for Plant",
        text: `Dear ${owner_first_name} ${owner_last_name},\n\nYou have been added as an individual user for the plant ${plant_name} 
        with EntityID: ${entityid}.\n\n 
       To set your password, click the link below:
                                https://testsolardl.antsai.in/forgotpassword/setYourPassword?${emailToken}

        To access your account, please login using the link below:
                                 https://testsolardl.antsai.in/login


.\n\nPlease log in with the above credentials.\n\nBest regards,\nTeam GSAI`,
      });
    } else {
      console.log(
        "Plant type is not individual. Finding sysadmin for entity and linking to plant..."
      );
      // Step 3: For non-individual plant types, find sysadmin and link to the plant
      const [sysadminUser] = await connection.query(
        'SELECT user_id, email FROM gsai_user WHERE entityid = ? AND user_role = "sys admin"',
        [entityid]
      );

      if (sysadminUser.length === 0) {
        console.error(
          "Sysadmin user not found for the given entity ID:",
          entityid
        );
        return res.status(404).json({
          message: "Sysadmin user not found for the given entity ID.",
        });
      }
      const sysadminUserId = sysadminUser[0].user_id;
      const sysadminEmail = sysadminUser[0].email;

      console.log("Linking sysadmin user to the plant in Gsai_PlantUser...");
      console.log("SMTP_HOST:", process.env.SMTP_HOST);
      console.log("SMTP_PORT:", process.env.SMTP_PORT);
      console.log("SMTP_USER:", process.env.SMTP_USER);
      await connection.query(
        "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)",
        [plant_id, sysadminUserId]
      );

      console.log("Sending email notification to the sysadmin user...");
      // Send email notification for non-individual plant type
      await transporter.sendMail({
        //from: "team.solardl@antsai.in",
        from: process.env.FROM_EMAIL,
        to: sysadminEmail,
        subject: "New Plant Added",
        text: `Login URL: https://testsolardl.antsai.in/login\n\nUsername: ${sysadminEmail}\nDefault password: Existing password user can use to login\n\nYours Truly,\nFrom Team GSAI`,
      });
    }

    await connection.commit();
    console.log("Transaction committed successfully. Plant and user linked.");
    res
      .status(201)
      .json({ message: "Plant and user linked successfully", plant_id });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding plant:", error);
    res
      .status(500)
      .json({ message: "Error adding plant", error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

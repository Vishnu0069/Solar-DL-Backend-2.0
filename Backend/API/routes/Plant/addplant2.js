// // todo   New code (added functionality if plant_type === individual add that user to EntityMaster and gsai_user)
// const express = require("express");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const { v4: uuidv4 } = require("uuid");
// const pool = require("../../db");
// const router = express.Router();

// require("dotenv").config({ path: __dirname + "/.env" });

// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "team.solardl@antsai.in",
//     pass: "TEamSOlarDL12301@",
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   debug: true,
// });

// router.post("/addPlant2", async (req, res) => {
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
//     owner_first_name,
//     owner_last_name,
//     owner_email,
//     mobile_number = null,
//     email_status,
//     mail,
//     EntityID,
//     LoginEntityID,
//   } = req.body;

//   if (!plant_id) {
//     return res.status(400).json({ message: "plant_id is required." });
//   }

//   let connection;

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Check if email already exists in gsai_user table
//     const [existingUser] = await connection.query(
//       "SELECT email FROM gsai_user WHERE email = ?",
//       [owner_email]
//     );

//     if (existingUser.length > 0) {
//       await connection.rollback();
//       return res.status(400).json({
//         message:
//           "Email already exists in the system. Please use a different email address.",
//       });
//     }

//     // Insert plant details into Gsai_PlantMaster
//     await connection.query(
//       `INSERT INTO Gsai_PlantMaster (
//         plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
//         plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
//         address_line2, pincode, longitude, latitude, owner_first_name,
//         owner_last_name, owner_email, mobileno
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
//       [
//         plant_id,
//         entityid,
//         plant_name,
//         install_date,
//         azimuth_angle,
//         tilt_angle,
//         plant_type,
//         plant_category,
//         capacity,
//         capacity_unit,
//         country,
//         region,
//         state,
//         district,
//         address_line1,
//         address_line2,
//         pincode,
//         longitude,
//         latitude,
//         owner_first_name,
//         owner_last_name,
//         owner_email,
//         mobile_number,
//       ]
//     );

//     let userIdsToLink = [];

//     // Handle individual plant type and insert records into EntityMaster and gsai_user
//     if (plant_type.toLowerCase() === "individual") {
//       let newEntityId = `${owner_first_name}${owner_last_name}`
//         .replace(/\s+/g, "")
//         .toUpperCase();
//       let suffix = 1001;

//       // Generate unique entityid
//       while (true) {
//         const [existingEntity] = await connection.query(
//           "SELECT entityid FROM EntityMaster WHERE entityid = ?",
//           [`${newEntityId}-${suffix}`]
//         );
//         if (existingEntity.length === 0) {
//           newEntityId = `${newEntityId}-${suffix}`;
//           break;
//         }
//         suffix++;
//       }

//       // Insert into EntityMaster
//       await connection.query(
//         `INSERT INTO EntityMaster (
//           entityid, entityname, category, contactfirstname, contactlastname, email, mobile,
//           country, state, district, pincode, namespace, creation_date, last_update_date, mark_deletion
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'gsai.greentek', NOW(), NOW(), 0)`,
//         [
//           newEntityId,
//           `${owner_first_name} ${owner_last_name}`,
//           plant_category,
//           owner_first_name,
//           owner_last_name,
//           owner_email,
//           mobile_number,
//           country,
//           state,
//           district,
//           pincode,
//         ]
//       );

//       // Generate new user_id and hash the default password
//       const newUserId = uuidv4();
//       const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);

//       // Insert into gsai_user
//       await connection.query(
//         `INSERT INTO gsai_user (
//           user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//           pin_code, country, entity_name, user_role, otp_status
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 1)`,
//         [
//           newUserId,
//           newEntityId,
//           owner_first_name,
//           owner_last_name,
//           owner_email,
//           hashedPassword,
//           mobile_number || "0000000000",
//           pincode,
//           country,
//           `${owner_first_name} ${owner_last_name}`,
//         ]
//       );

//       // Link the user to the plant
//       await connection.query(
//         "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)",
//         [plant_id, newUserId]
//       );

//       // Add owner to email notification list
//       userIdsToLink.push({
//         userId: newUserId,
//         email: owner_email,
//       });
//     }

//     // Handle notification emails based on email_status and mail
//     if (email_status === 1 && mail === 2) {
//       console.log("Condition 1: Email exists, sending two emails...");
//       const [selectedEntityUser] = await connection.query(
//         "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
//         [EntityID]
//       );

//       if (selectedEntityUser && selectedEntityUser.length > 0) {
//         userIdsToLink.push({
//           userId: selectedEntityUser[0].user_id,
//           email: selectedEntityUser[0].email,
//         });

//         console.log("Sending emails for email_status: 1, mail: 2...");
//         await Promise.all([
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: selectedEntityUser[0].email,
//             subject: "Plant Added Notification",
//             text: `The plant ${plant_name} has been added with a user as individual.`,
//           }),
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: owner_email,
//             subject: "Plant Added",
//             text: `You have been added as an individual user for the plant ${plant_name}.`,
//           }),
//         ]);
//       }
//     } else if (email_status === 2 && mail === 3) {
//       console.log("Condition 2: Email exists, sending three emails...");

//       const [loginEntityUser] = await connection.query(
//         "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
//         [LoginEntityID]
//       );

//       const [selectedEntityUser] = await connection.query(
//         "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
//         [EntityID]
//       );

//       // Collect valid email recipients
//       const emailPromises = [];

//       // Only add users to linking array and email list if they exist
//       if (loginEntityUser && loginEntityUser.length > 0) {
//         userIdsToLink.push({
//           userId: loginEntityUser[0].user_id,
//           email: loginEntityUser[0].email,
//         });

//         emailPromises.push(
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: loginEntityUser[0].email,
//             subject: "Plant Added Notification",
//             text: `The plant ${plant_name} has been added.`,
//           })
//         );
//       }

//       if (selectedEntityUser && selectedEntityUser.length > 0) {
//         userIdsToLink.push({
//           userId: selectedEntityUser[0].user_id,
//           email: selectedEntityUser[0].email,
//         });

//         emailPromises.push(
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: selectedEntityUser[0].email,
//             subject: "Plant Added Notification",
//             text: `The plant ${plant_name} has been added with a user as individual.`,
//           })
//         );
//       }

//       // Always send email to the owner
//       emailPromises.push(
//         transporter.sendMail({
//           from: process.env.SMTP_USER,
//           to: owner_email,
//           subject: "Plant Added",
//           text: `You have been added as an individual user for the plant ${plant_name}.`,
//         })
//       );

//       console.log("Sending emails for email_status: 2, mail: 3...");
//       await Promise.all(emailPromises);
//     } else if (email_status === 3 && mail === 2) {
//       console.log("Condition 3: Email does not exist, sending two emails...");
//       const [loginEntityUser] = await connection.query(
//         "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
//         [LoginEntityID]
//       );

//       const emailPromises = [];

//       if (loginEntityUser && loginEntityUser.length > 0) {
//         userIdsToLink.push({
//           userId: loginEntityUser[0].user_id,
//           email: loginEntityUser[0].email,
//         });

//         emailPromises.push(
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: loginEntityUser[0].email,
//             subject: "Plant Added Notification",
//             text: `The plant ${plant_name} has been added.`,
//           })
//         );
//       }

//       emailPromises.push(
//         transporter.sendMail({
//           from: process.env.SMTP_USER,
//           to: owner_email,
//           subject: "Plant Added",
//           text: `You have been added as an individual user for the plant ${plant_name}.`,
//         })
//       );

//       console.log("Sending emails for email_status: 3, mail: 2...");
//       await Promise.all(emailPromises);
//     } else if (email_status === 4 && mail === 3) {
//       console.log("Condition 4: Email does not exist, sending three emails...");

//       const [loginEntityUser] = await connection.query(
//         "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
//         [LoginEntityID]
//       );

//       const [selectedEntityUser] = await connection.query(
//         "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
//         [EntityID]
//       );

//       const emailPromises = [];

//       if (loginEntityUser && loginEntityUser.length > 0) {
//         userIdsToLink.push({
//           userId: loginEntityUser[0].user_id,
//           email: loginEntityUser[0].email,
//         });

//         emailPromises.push(
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: loginEntityUser[0].email,
//             subject: "Plant Added Notification",
//             text: `The plant ${plant_name} has been added.`,
//           })
//         );
//       }

//       if (selectedEntityUser && selectedEntityUser.length > 0) {
//         userIdsToLink.push({
//           userId: selectedEntityUser[0].user_id,
//           email: selectedEntityUser[0].email,
//         });

//         emailPromises.push(
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: selectedEntityUser[0].email,
//             subject: "Plant Added Notification",
//             text: `The plant ${plant_name} has been added with a user as individual.`,
//           })
//         );
//       }

//       emailPromises.push(
//         transporter.sendMail({
//           from: process.env.SMTP_USER,
//           to: owner_email,
//           subject: "Plant Added",
//           text: `You have been added as an individual user for the plant ${plant_name}.`,
//         })
//       );

//       console.log("Sending emails for email_status: 4, mail: 3...");
//       await Promise.all(emailPromises);
//     }

//     // Link users to the plant
//     console.log("Linking users to the plant in Gsai_PlantUser...");
//     for (const { userId } of userIdsToLink) {
//       await connection.query(
//         "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?);",
//         [plant_id, userId]
//       );
//     }

//     await connection.commit();
//     console.log("Transaction committed successfully.");
//     res
//       .status(201)
//       .json({ message: "Plant and user(s) linked successfully", plant_id });
//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error("Error adding plant:", error);
//     res.status(500).json({
//       message: "Error adding plant",
//       error: error.message,
//     });
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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true, // Enable detailed logging
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
    owner_first_name,
    owner_last_name,
    owner_email,
    mobileNumber = null,
    email_status,
    mail,
    entityname,
    Email,
    EntityID,
    LoginEntityID,
  } = req.body;

  // Validate required fields
  if (!plant_id || !email_status || !mail || !LoginEntityID || !EntityID) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    console.log("Starting transaction for adding plant...");

    // Step 1: Insert plant details into Gsai_PlantMaster
    console.log("Inserting plant details into Gsai_PlantMaster...");
    await connection.query(
      `INSERT INTO Gsai_PlantMaster (
        plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
        plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
        address_line2, pincode, longitude, latitude, owner_first_name,
        owner_last_name, owner_email, mobileno, entityname
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
        owner_first_name,
        owner_last_name,
        owner_email,
        mobileNumber,
        entityname,
      ]
    );

    let userIdsToLink = [];
    let newUserId;

    // Step 2: Handle Individual or Non-Individual Plant Type
    if (plant_type.toLowerCase() === "individual") {
      console.log("Handling individual plant type...");
      console.log("Creating a new individual user...");
      newUserId = uuidv4();

      const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);

      await connection.query(
        `INSERT INTO gsai_user (
          user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
          pin_code, country, entity_name, user_role, user_type, otp_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 'plant_user', 1)`,
        [
          newUserId,
          EntityID,
          owner_first_name,
          owner_last_name,
          owner_email,
          hashedPassword,
          mobileNumber || "0000000000",
          pincode,
          country,
          plant_name,
        ]
      );

      console.log("Linking individual user to the plant...");
      await connection.query(
        "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?);",
        [plant_id, newUserId]
      );

      userIdsToLink.push({ userId: newUserId, email: owner_email });
    } else {
      console.log("Handling non-individual plant type...");
      const [sysadminUser] = await connection.query(
        "SELECT user_id, email, user_role FROM gsai_user WHERE entityid = ? LIMIT 1;",
        [EntityID]
      );

      if (
        sysadminUser.length === 0 ||
        sysadminUser[0].user_role !== "sys admin"
      ) {
        console.log("Sysadmin not found, creating a new sysadmin...");
        newUserId = uuidv4();

        const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);

        await connection.query(
          `INSERT INTO gsai_user (
            user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
            pin_code, country, entity_name, user_role, user_type, otp_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sys admin', 'plant_user', 1)`,
          [
            newUserId,
            EntityID,
            owner_first_name,
            owner_last_name,
            owner_email,
            hashedPassword,
            mobileNumber || "0000000000",
            pincode,
            country,
            entityname,
          ]
        );
      } else {
        newUserId = sysadminUser[0].user_id;
        userIdsToLink.push({ userId: newUserId, email: sysadminUser[0].email });
      }

      console.log("Linking sysadmin to the plant...");
      await connection.query(
        "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?);",
        [plant_id, newUserId]
      );
    }

    // Step 3: Dynamic Mailing Logic Based on email_status and mail
    console.log("Handling mailing logic...");
    if (email_status === 1 && mail === 2) {
      console.log("Condition 1: Sending 2 emails...");
      await Promise.all(
        userIdsToLink.map(({ email }) =>
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Plant Added Notification",
            text: `Dear User,\n\nYou have been added to the plant ${plant_name}.`,
          })
        )
      );
    } else if (email_status === 2 && mail === 3) {
      console.log("Condition 2: Sending 3 emails...");
      await Promise.all(
        userIdsToLink.map(({ email }) =>
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Plant Added Notification",
            text: `Dear User,\n\nYou have been added to the plant ${plant_name}.`,
          })
        )
      );
    } else if (email_status === 3 && mail === 2) {
      console.log("Condition 3: Sending email for mismatched LoginEntityID...");
      await Promise.all(
        userIdsToLink.map(({ email }) =>
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Entity Mismatch Notification",
            text: `Dear User,\n\nThere was a mismatch with the selected entity (${entityid}) and login entity (${LoginEntityID}).`,
          })
        )
      );
    } else if (email_status === 4 && mail === 3) {
      console.log("Condition 4: Sending email for non-existent entity...");
      await Promise.all(
        userIdsToLink.map(({ email }) =>
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Entity Not Found",
            text: `Dear User,\n\nThe entity associated with the plant (${entityid}) does not exist.`,
          })
        )
      );
    } else if (email_status === 5 && mail === 2) {
      console.log("Condition 5: Sending email for sysadmin notification...");
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: owner_email,
        subject: "Sysadmin Notification",
        text: `Dear Admin,\n\nA new plant (${plant_name}) has been added under your entity (${EntityID}).`,
      });
    } else if (email_status === 6 && mail === 3) {
      console.log("Condition 6: Sending admin alert email...");
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: owner_email,
        subject: "Admin Alert",
        text: `Dear Admin,\n\nThe plant (${plant_name}) was added with non-standard configurations.`,
      });
    } else if (email_status === 7 && mail === 3) {
      console.log("Condition 7: Sending fallback notification...");
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: owner_email,
        subject: "Fallback Notification",
        text: `Dear User,\n\nThe plant (${plant_name}) has been successfully added. Please review the details.`,
      });
    }

    await connection.commit();
    console.log("Transaction committed successfully.");
    res
      .status(201)
      .json({ message: "Plant and user(s) linked successfully", plant_id });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding plant:", error);
    res
      .status(500)
      .json({ message: "Error adding plant.", error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

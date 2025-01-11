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

//todo //addPlant
// const express = require("express");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const { v4: uuidv4 } = require("uuid"); // Import the UUID generator
// const pool = require("../../db");
// const router = express.Router();

// require("dotenv").config({ path: __dirname + "/.env" });

// // const transporter = nodemailer.createTransport({
// //   host: process.env.SMTP_HOST,
// //   port: parseInt(process.env.SMTP_PORT, 10),
// //   secure: true,
// //   auth: {
// //     user: process.env.SMTP_USER,
// //     pass: process.env.SMTP_PASS,
// //   },
// //   debug: true, // Enable detailed logging
// // });
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT, 10),
//   secure: true,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false, // Disables certificate verification
//   },
//   debug: true, // Enable detailed logging
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
//     mobileNumber = null,
//     email_status,
//     mail,
//     entityname,
//     Email,
//     EntityID,
//     LoginEntityID,
//   } = req.body;

//   // Validate required fields
//   if (!plant_id || !email_status || !mail || !LoginEntityID || !EntityID) {
//     return res.status(400).json({ message: "Missing required fields." });
//   }

//   let connection;

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();
//     console.log("Starting transaction for adding plant...");

//     // Step 1: Insert plant details into Gsai_PlantMaster
//     console.log("Inserting plant details into Gsai_PlantMaster...");
//     await connection.query(
//       `INSERT INTO Gsai_PlantMaster (
//         plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
//         plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
//         address_line2, pincode, longitude, latitude, owner_first_name,
//         owner_last_name, owner_email, mobileno, entityname
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
//         mobileNumber,
//         entityname,
//       ]
//     );

//     let userIdsToLink = [];
//     let newUserId;

//     // Step 2: Handle Individual or Non-Individual Plant Type
//     if (plant_type.toLowerCase() === "individual") {
//       console.log("Handling individual plant type...");
//       if (
//         email_status === 1 ||
//         email_status === 2 ||
//         email_status === 3 ||
//         email_status === 4
//       ) {
//         console.log("Creating a new individual user...");
//         newUserId = uuidv4();

//         const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);

//         await connection.query(
//           `INSERT INTO gsai_user (
//             user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//             pin_code, country, entity_name, user_role, user_type, otp_status
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 'plant_user', 1)`,
//           [
//             newUserId,
//             EntityID,
//             owner_first_name,
//             owner_last_name,
//             owner_email,
//             hashedPassword,
//             mobileNumber || "0000000000",
//             pincode,
//             country,
//             plant_name,
//           ]
//         );

//         console.log("Linking individual user to the plant...");
//         await connection.query(
//           "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?);",
//           [plant_id, newUserId]
//         );

//         userIdsToLink.push({ userId: newUserId, email: owner_email });
//       }
//     } else {
//       console.log("Handling non-individual plant type...");
//       const [sysadminUser] = await connection.query(
//         "SELECT user_id, email FROM gsai_user WHERE entityid = ? AND user_role = 'sys admin' LIMIT 1;",
//         [EntityID]
//       );

//       if (sysadminUser.length === 0) {
//         console.log("Sysadmin not found, creating a new sysadmin...");
//         newUserId = uuidv4();

//         const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);

//         await connection.query(
//           `INSERT INTO gsai_user (
//             user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//             pin_code, country, entity_name, user_role, user_type, otp_status
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sys admin', 'plant_user', 1)`,
//           [
//             newUserId,
//             EntityID,
//             owner_first_name,
//             owner_last_name,
//             owner_email,
//             hashedPassword,
//             mobileNumber || "0000000000",
//             pincode,
//             country,
//             entityname,
//           ]
//         );
//       } else {
//         newUserId = sysadminUser[0].user_id;
//         userIdsToLink.push({ userId: newUserId, email: sysadminUser[0].email });
//       }

//       console.log("Linking sysadmin to the plant...");
//       await connection.query(
//         "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?);",
//         [plant_id, newUserId]
//       );
//     }

//     // Step 3: Dynamic Mailing Logic Based on email_status and mail
//     console.log("Handling mailing logic...");
//     if (email_status === 1 && mail === 2) {
//       console.log("Condition 1: Sending 2 emails...");
//       await Promise.all(
//         userIdsToLink.map(({ email }) =>
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: email,
//             subject: "Plant Added Notification",
//             text: `Dear User,\n\nYou have been added to the plant ${plant_name}.`,
//           })
//         )
//       );
//     } else if (email_status === 2 && mail === 3) {
//       console.log("Condition 2: Sending 3 emails...");
//       await Promise.all(
//         userIdsToLink.map(({ email }) =>
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: email,
//             subject: "Plant Added Notification",
//             text: `Dear User,\n\nYou have been added to the plant ${plant_name}.`,
//           })
//         )
//       );
//     } else if (email_status === 3 || email_status === 4) {
//       console.log("Conditions 3 or 4: Sending emails...");
//       await Promise.all(
//         userIdsToLink.map(({ email }) =>
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: email,
//             subject: "Plant Added Notification",
//             text: `Dear User,\n\nThe plant ${plant_name} has been successfully added.`,
//           })
//         )
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
//     res
//       .status(500)
//       .json({ message: "Error adding plant.", error: error.message });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// module.exports = router;

//todo
// const express = require("express");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const { v4: uuidv4 } = require("uuid");
// const pool = require("../../db");
// const router = express.Router();

// require("dotenv").config({ path: __dirname + "/.env" });

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT, 10),
//   secure: true,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   debug: true,
// });

// const emailTemplates = {
//   newUser: {
//     subject: "Welcome to Plant Management System",
//     text: (plantName) => `Dear User,

// Welcome to the Plant Management System! A new account has been created for you for the plant "${plantName}".
// Your default password is: DefaultPass@123
// Please change your password upon first login.

// Best regards,
// Plant Management Team`,
//   },
//   existingUser: {
//     subject: "Plant Added Successfully",
//     text: (plantName) => `Dear User,

// A new plant "${plantName}" has been successfully added to your account.

// Best regards,
// Plant Management Team`,
//   },
//   adminNotification: {
//     subject: "New Plant Added Notification",
//     text: (plantName, ownerEmail) => `Dear Admin,

// A new plant "${plantName}" has been added to the system by user ${ownerEmail}.

// Best regards,
// Plant Management Team`,
//   },
// };

// async function sendEmail(recipient, template, plantName, ownerEmail = null) {
//   return transporter.sendMail({
//     from: process.env.SMTP_USER,
//     to: recipient,
//     subject: template.subject,
//     text: ownerEmail
//       ? template.text(plantName, ownerEmail)
//       : template.text(plantName),
//   });
// }

// async function handleEmailSending(
//   connection,
//   emailStatus,
//   mail,
//   plant_name,
//   owner_email,
//   EntityID,
//   LoginEntityID,
//   isNewUser
// ) {
//   try {
//     const emailPromises = [];

//     // Individual Plant Type Cases
//     if (emailStatus >= 1 && emailStatus <= 4) {
//       // Send email to owner
//       if (isNewUser) {
//         emailPromises.push(
//           sendEmail(owner_email, emailTemplates.newUser, plant_name)
//         );
//       } else {
//         emailPromises.push(
//           sendEmail(owner_email, emailTemplates.existingUser, plant_name)
//         );
//       }

//       // For cases where admin notification is needed (emailStatus = 2 or 4 and mail = 3)
//       if ((emailStatus === 2 || emailStatus === 4) && mail === 3) {
//         const [admins] = await connection.query(
//           `SELECT DISTINCT email
//            FROM gsai_user
//            WHERE user_role = 'sys admin'
//            AND entityid IN (?, ?)
//            AND email != ?`,
//           [EntityID, LoginEntityID, owner_email]
//         );

//         for (const admin of admins) {
//           emailPromises.push(
//             sendEmail(
//               admin.email,
//               emailTemplates.adminNotification,
//               plant_name,
//               owner_email
//             )
//           );
//         }
//       }
//     }
//     // Non-Individual Plant Type Cases
//     else if (emailStatus >= 5 && emailStatus <= 7) {
//       // Send email to owner/sys admin
//       if (isNewUser) {
//         emailPromises.push(
//           sendEmail(owner_email, emailTemplates.newUser, plant_name)
//         );
//       } else {
//         emailPromises.push(
//           sendEmail(owner_email, emailTemplates.existingUser, plant_name)
//         );
//       }

//       // For cases where additional admin notification is needed (emailStatus >= 5 and mail = 3)
//       if (mail === 3) {
//         const [admins] = await connection.query(
//           `SELECT DISTINCT email
//            FROM gsai_user
//            WHERE user_role = 'sys admin'
//            AND entityid IN (?, ?)
//            AND email != ?`,
//           [EntityID, LoginEntityID, owner_email]
//         );

//         for (const admin of admins) {
//           emailPromises.push(
//             sendEmail(
//               admin.email,
//               emailTemplates.adminNotification,
//               plant_name,
//               owner_email
//             )
//           );
//         }
//       }
//     }

//     await Promise.all(emailPromises);
//     console.log(`Successfully sent ${emailPromises.length} emails`);
//   } catch (error) {
//     console.error("Error sending emails:", error);
//     // Continue with the transaction even if email sending fails
//   }
// }

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
//     mobileNumber = null,
//     email_status,
//     mail,
//     entityname,
//     Email,
//     EntityID,
//     LoginEntityID,
//   } = req.body;

//   if (!plant_id || !email_status || !mail || !LoginEntityID || !EntityID) {
//     return res.status(400).json({ message: "Missing required fields." });
//   }

//   let connection;

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     let userId;
//     let isNewUser = false;

//     // Step 1: Handle User Creation/Retrieval
//     if (plant_type.toLowerCase() === "individual") {
//       const [existingUser] = await connection.query(
//         "SELECT user_id, email FROM gsai_user WHERE LOWER(email) = LOWER(?)",
//         [owner_email]
//       );

//       if (existingUser.length > 0) {
//         userId = existingUser[0].user_id;
//       } else if ([1, 2, 3, 4].includes(email_status)) {
//         userId = uuidv4();
//         const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);
//         isNewUser = true;

//         await connection.query(
//           `INSERT INTO gsai_user (
//             user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//             pin_code, country, entity_name, user_role, user_type, otp_status
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 'plant_user', 1)`,
//           [
//             userId,
//             EntityID,
//             owner_first_name,
//             owner_last_name,
//             owner_email,
//             hashedPassword,
//             mobileNumber || "0000000000",
//             pincode,
//             country,
//             plant_name,
//           ]
//         );
//       }
//     } else {
//       const [existingSysAdmin] = await connection.query(
//         "SELECT user_id, email FROM gsai_user WHERE entityid = ? AND user_role = 'sys admin' LIMIT 1;",
//         [EntityID]
//       );

//       if (existingSysAdmin.length > 0) {
//         userId = existingSysAdmin[0].user_id;
//       } else {
//         userId = uuidv4();
//         const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);
//         isNewUser = true;

//         await connection.query(
//           `INSERT INTO gsai_user (
//             user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//             pin_code, country, entity_name, user_role, user_type, otp_status
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sys admin', 'plant_user', 1)`,
//           [
//             userId,
//             EntityID,
//             owner_first_name,
//             owner_last_name,
//             owner_email,
//             hashedPassword,
//             mobileNumber || "0000000000",
//             pincode,
//             country,
//             entityname,
//           ]
//         );
//       }
//     }

//     // Step 2: Insert plant details
//     await connection.query(
//       `INSERT INTO Gsai_PlantMaster (
//         plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
//         plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
//         address_line2, pincode, longitude, latitude, owner_first_name,
//         owner_last_name, owner_email, mobileno, entityname
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
//         mobileNumber,
//         entityname,
//       ]
//     );

//     // Step 3: Link user to plant
//     if (userId) {
//       await connection.query(
//         "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?);",
//         [plant_id, userId]
//       );
//     }

//     // Step 4: Handle email sending based on conditions
//     await handleEmailSending(
//       connection,
//       email_status,
//       mail,
//       plant_name,
//       owner_email,
//       EntityID,
//       LoginEntityID,
//       isNewUser
//     );

//     await connection.commit();
//     res.status(201).json({
//       message: "Plant and user(s) linked successfully",
//       plant_id,
//     });
//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error("Error adding plant:", error);
//     res.status(500).json({
//       message: "Error adding plant.",
//       error: error.message,
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// module.exports = router;

// todo new code with email configurations
const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
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
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
});

const emailTemplates = {
  newUser: {
    subject: "Welcome to Plant Management System",
    text: (plantName) => `Dear User,

Welcome to the Plant Management System! A new account has been created for you for the plant "${plantName}".
Your default password is: DefaultPass@123
Please change your password upon first login.

Best regards,
Plant Management Team`,
  },
  existingUser: {
    subject: "Plant Added Successfully",
    text: (plantName) => `Dear User,

A new plant "${plantName}" has been successfully added to your account.

Best regards,
Plant Management Team`,
  },
  adminNotification: {
    subject: "New Plant Added Notification",
    text: (plantName, ownerEmail) => `Dear Admin,

A new plant "${plantName}" has been added to the system by user ${ownerEmail}.

Best regards,
Plant Management Team`,
  },
};

async function sendEmail(recipient, template, plantName, ownerEmail = null) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: recipient,
      subject: template.subject,
      text: ownerEmail
        ? template.text(plantName, ownerEmail)
        : template.text(plantName),
    });
    console.log(`Email sent successfully to ${recipient}`);
  } catch (error) {
    console.error(`Error sending email to ${recipient}:`, error);
    throw error;
  }
}

async function handleEmailSending(
  connection,
  emailStatus,
  mail,
  plant_name,
  owner_email,
  EntityID,
  LoginEntityID,
  isNewUser
) {
  try {
    const emailPromises = [];
    console.log(
      `Processing emails for emailStatus=${emailStatus}, mail=${mail}`
    );

    // Individual Plant Type Cases (emailStatus 1-4)
    if (emailStatus >= 1 && emailStatus <= 4) {
      // Always send email to owner
      if (isNewUser) {
        emailPromises.push(
          sendEmail(owner_email, emailTemplates.newUser, plant_name)
        );
      } else {
        emailPromises.push(
          sendEmail(owner_email, emailTemplates.existingUser, plant_name)
        );
      }

      // Case 1: Same entity admin notification (emailStatus = 1, mail = 2)
      if (emailStatus === 1 && mail === 2) {
        const [sameEntityAdmins] = await connection.query(
          `SELECT DISTINCT email 
           FROM gsai_user 
           WHERE user_role = 'sys admin' 
           AND entityid = ? 
           AND email != ?`,
          [EntityID, owner_email]
        );

        console.log(`Found ${sameEntityAdmins.length} same entity admins`);
        for (const admin of sameEntityAdmins) {
          emailPromises.push(
            sendEmail(
              admin.email,
              emailTemplates.adminNotification,
              plant_name,
              owner_email
            )
          );
        }
      }

      // Case 2 & 4: Cross-entity admin notification (emailStatus = 2 or 4, mail = 3)
      else if ((emailStatus === 2 || emailStatus === 4) && mail === 3) {
        const [crossEntityAdmins] = await connection.query(
          `SELECT DISTINCT email 
           FROM gsai_user 
           WHERE user_role = 'sys admin' 
           AND entityid IN (?, ?) 
           AND email != ?`,
          [EntityID, LoginEntityID, owner_email]
        );

        console.log(`Found ${crossEntityAdmins.length} cross-entity admins`);
        for (const admin of crossEntityAdmins) {
          emailPromises.push(
            sendEmail(
              admin.email,
              emailTemplates.adminNotification,
              plant_name,
              owner_email
            )
          );
        }
      }
    }
    // Non-Individual Plant Type Cases (emailStatus 5-7)
    else if (emailStatus >= 5 && emailStatus <= 7) {
      // Send to owner/sys admin
      if (isNewUser) {
        emailPromises.push(
          sendEmail(owner_email, emailTemplates.newUser, plant_name)
        );
      } else {
        emailPromises.push(
          sendEmail(owner_email, emailTemplates.existingUser, plant_name)
        );
      }

      // Additional admin notifications for mail = 3
      if (mail === 3) {
        const [admins] = await connection.query(
          `SELECT DISTINCT email 
           FROM gsai_user 
           WHERE user_role = 'sys admin' 
           AND entityid IN (?, ?) 
           AND email != ?`,
          [EntityID, LoginEntityID, owner_email]
        );

        console.log(`Found ${admins.length} admins for non-individual plant`);
        for (const admin of admins) {
          emailPromises.push(
            sendEmail(
              admin.email,
              emailTemplates.adminNotification,
              plant_name,
              owner_email
            )
          );
        }
      }
    }

    await Promise.all(emailPromises);
    console.log(`Successfully sent ${emailPromises.length} emails`);
  } catch (error) {
    console.error("Error in handleEmailSending:", error);
    // Continue with the transaction even if email sending fails
  }
}

router.post("/addPlant2", async (req, res) => {
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

  if (!plant_id || !email_status || !mail || !LoginEntityID || !EntityID) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let userId;
    let isNewUser = false;

    // Step 1: Handle User Creation/Retrieval
    if (plant_type.toLowerCase() === "individual") {
      const [existingUser] = await connection.query(
        "SELECT user_id, email FROM gsai_user WHERE LOWER(email) = LOWER(?)",
        [owner_email]
      );

      if (existingUser.length > 0) {
        userId = existingUser[0].user_id;
      } else if ([1, 2, 3, 4].includes(email_status)) {
        userId = uuidv4();
        const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);
        isNewUser = true;

        await connection.query(
          `INSERT INTO gsai_user (
            user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
            pin_code, country, entity_name, user_role, user_type, otp_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 'plant_user', 1)`,
          [
            userId,
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
      }
    } else {
      const [existingSysAdmin] = await connection.query(
        "SELECT user_id, email FROM gsai_user WHERE entityid = ? AND user_role = 'sys admin' LIMIT 1;",
        [EntityID]
      );

      if (existingSysAdmin.length > 0) {
        userId = existingSysAdmin[0].user_id;
      } else {
        userId = uuidv4();
        const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);
        isNewUser = true;

        await connection.query(
          `INSERT INTO gsai_user (
            user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
            pin_code, country, entity_name, user_role, user_type, otp_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sys admin', 'plant_user', 1)`,
          [
            userId,
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
      }
    }

    // Step 2: Insert plant details
    await connection.query(
      `INSERT INTO Gsai_PlantMaster (
        plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
        plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
        address_line2, pincode, longitude, latitude, owner_first_name,
        owner_last_name, owner_email, mobileno, entityname
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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

    // Step 3: Link user to plant
    if (userId) {
      await connection.query(
        "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?);",
        [plant_id, userId]
      );
    }

    // Step 4: Handle email sending based on conditions
    await handleEmailSending(
      connection,
      email_status,
      mail,
      plant_name,
      owner_email,
      EntityID,
      LoginEntityID,
      isNewUser
    );

    await connection.commit();
    res.status(201).json({
      message: "Plant and user(s) linked successfully",
      plant_id,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding plant:", error);
    res.status(500).json({
      message: "Error adding plant.",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

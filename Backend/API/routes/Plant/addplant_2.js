// const express = require("express");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const { v4: uuidv4 } = require("uuid"); // Import the UUID generator
// const pool = require("../../db");
// const router = express.Router();
// require("dotenv").config();

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

// router.post("/addPlant", async (req, res) => {
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
//     mobileNumber = null,
//     email_status = null, // New field with default null
//     mail = null, // New field with default null
//     entityname,
//   } = req.body;

//   if (!plant_id) {
//     return res.status(400).json({ message: "plant_id is required." });
//   }

//   let connection;

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();
//     console.log("Starting transaction for adding plant...");

//     // Log email_status and mail to the console
//     console.log(`email_status: ${email_status}, mail: ${mail}`);

//     // Step 1: Insert plant details into Gsai_PlantMaster
//     console.log("Inserting plant details into Gsai_PlantMaster...");
//     await connection.query(
//       `INSERT INTO Gsai_PlantMaster (
//         plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
//         plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
//         address_line2, pincode, longitude, latitude, data_logger, inverter, owner_first_name,
//         owner_last_name, owner_email,mobileno,entityname
//        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? );`,
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
//         data_logger,
//         inverter,
//         owner_first_name,
//         owner_last_name,
//         owner_email,
//         mobileNumber,
//         entityname,
//       ]
//     );

//     if (plant_type.toLowerCase() === "individual") {
//       console.log(
//         "Plant type is individual. Creating a new user with role 'individual'..."
//       );
//       // Step 2: Create a new individual user linked to the plant
//       const newUserId = uuidv4();
//       const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);

//       // hashing the email
//       const emailToken = await bcrypt.hash(owner_email, 10);

//       // Insert the new user with role 'individual'
//       console.log(
//         "Inserting new individual user into gsai_user with ID:",
//         newUserId
//       );
//       await connection.query(
//         `INSERT INTO gsai_user (
//           user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
//           pin_code, country, entity_name, user_role, otp_status,token
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 1,?)`,
//         [
//           newUserId,
//           entityid,
//           owner_first_name,
//           owner_last_name,
//           owner_email,
//           hashedPassword,
//           mobileNumber || "0000000000", // todo mobileNumber || "0000000000",
//           pincode,
//           country,
//           plant_name,
//           emailToken,
//         ]
//       );

//       console.log("Linking the new user to the plant in Gsai_PlantUser...");
//       // Link the individual user to the plant in Gsai_PlantUser
//       await connection.query(
//         "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)",
//         [plant_id, newUserId]
//       );

//       console.log("Sending email notification to the new individual user...");
//       // Send email notification to the new individual user
//       await transporter.sendMail({
//         from: "team.solardl@antsai.in",
//         to: owner_email,
//         subject: "New Individual User Created for Plant",
//         text: `Dear ${owner_first_name} ${owner_last_name},\n\nYou have been added as an individual user for the plant ${plant_name}
//         with EntityID: ${entityid}.\n\n
//        To set your password, click the link below:
//                                 https://testsolardl.antsai.in/forgotpassword/setYourPassword?${emailToken}

//         To access your account, please login using the link below:
//                                  https://testsolardl.antsai.in/login

// .\n\nPlease log in with the above credentials.\n\nBest regards,\nTeam GSAI`,
//       });
//     } else {
//       console.log(
//         "Plant type is not individual. Finding sysadmin for entity and linking to plant..."
//       );
//       // Step 3: For non-individual plant types, find sysadmin and link to the plant
//       const [sysadminUser] = await connection.query(
//         'SELECT user_id, email FROM gsai_user WHERE entityid = ? AND user_role = "sys admin"',
//         [entityid]
//       );

//       if (sysadminUser.length === 0) {
//         console.error(
//           "Sysadmin user not found for the given entity ID:",
//           entityid
//         );
//         return res.status(404).json({
//           message: "Sysadmin user not found for the given entity ID.",
//         });
//       }
//       const sysadminUserId = sysadminUser[0].user_id;
//       const sysadminEmail = sysadminUser[0].email;

//       console.log("Linking sysadmin user to the plant in Gsai_PlantUser...");
//       await connection.query(
//         "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)",
//         [plant_id, sysadminUserId]
//       );

//       console.log("Sending email notification to the sysadmin user...");
//       // Send email notification for non-individual plant type
//       await transporter.sendMail({
//         from: "team.solardl@antsai.in",
//         to: sysadminEmail,
//         subject: "New Plant Added",
//         text: `Login URL: https://testsolardl.antsai.in/login\n\nUsername: ${sysadminEmail}\nDefault password: Existing password user can use to login\n\nYours Truly,\nFrom Team GSAI`,
//       });
//     }

//     await connection.commit();
//     console.log("Transaction committed successfully. Plant and user linked.");
//     res
//       .status(201)
//       .json({ message: "Plant and user linked successfully", plant_id });
//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error("Error adding plant:", error);
//     res
//       .status(500)
//       .json({ message: "Error adding plant", error: error.message });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// module.exports = router;

// const express = require("express");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const { v4: uuidv4 } = require("uuid"); // Import the UUID generator
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
//   debug: true, // Enable detailed logging
// });

// router.post("/addPlant", async (req, res) => {
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
//     mobileNumber = null,
//     email_status = null,
//     mail = null,
//     entityname,
//     Email,
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
//     console.log("Starting transaction for adding plant...");

//     // Insert plant details into Gsai_PlantMaster
//     console.log("Inserting plant details into Gsai_PlantMaster...");
//     await connection.query(
//       `INSERT INTO Gsai_PlantMaster (
//         plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
//         plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
//         address_line2, pincode, longitude, latitude, data_logger, inverter, owner_first_name,
//         owner_last_name, owner_email, mobileno, entityname
//        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
//         data_logger,
//         inverter,
//         owner_first_name,
//         owner_last_name,
//         owner_email,
//         mobileNumber,
//         entityname,
//       ]
//     );

//     let userIdsToLink = [];

//     if (plant_type.toLowerCase() === "individual") {
//       console.log("Fetching email status conditions...");

//       // Fetch email status and conditions
//       const [emailStatusResponse] = await pool.query(
//         `
//           SELECT entityid, user_role
//           FROM gsai_user
//           WHERE LOWER(email) = LOWER(?);
//         `,
//         [Email]
//       );

//       if (email_status === 1 && mail === 2) {
//         console.log("Condition 1: Email exists, sending two emails...");
//         const [selectedEntityUser] = await pool.query(
//           "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
//           [EntityID]
//         );

//         if (selectedEntityUser.length > 0) {
//           userIdsToLink.push({
//             userId: selectedEntityUser[0].user_id,
//             email: selectedEntityUser[0].email,
//           });

//           console.log("Sending emails for email_status: 1, mail: 2...");
//           await Promise.all([
//             transporter.sendMail({
//               from: process.env.SMTP_USER,
//               to: selectedEntityUser[0].email,
//               subject: "Plant Added Notification",
//               text: `The plant ${plant_name} has been added with a user as individual.`,
//             }),
//             transporter.sendMail({
//               from: process.env.SMTP_USER,
//               to: owner_email,
//               subject: "Plant Added",
//               text: `You have been added as an individual user for the plant ${plant_name}.`,
//             }),
//           ]);
//         }
//       } else if (email_status === 2 && mail === 3) {
//         console.log("Condition 2: Email exists, sending three emails...");

//         const [loginEntityUser] = await pool.query(
//           "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
//           [LoginEntityID]
//         );

//         const [selectedEntityUser] = await pool.query(
//           "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
//           [EntityID]
//         );

//         if (loginEntityUser.length > 0) {
//           userIdsToLink.push({
//             userId: loginEntityUser[0].user_id,
//             email: loginEntityUser[0].email,
//           });
//         }

//         if (selectedEntityUser.length > 0) {
//           userIdsToLink.push({
//             userId: selectedEntityUser[0].user_id,
//             email: selectedEntityUser[0].email,
//           });
//         }

//         console.log("Sending emails for email_status: 2, mail: 3...");
//         await Promise.all([
//           transporter.sendMail({
//             from: process.env.SMTP_USER,
//             to: loginEntityUser[0].email,
//             subject: "Plant Added Notification",
//             text: `The plant ${plant_name} has been added.`,
//           }),
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

//       console.log("Linking users to the plant in Gsai_PlantUser...");
//       for (const { userId } of userIdsToLink) {
//         await connection.query(
//           "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?);",
//           [plant_id, userId]
//         );
//       }
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
//       .json({ message: "Error adding plant", error: error.message });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// module.exports = router;

// todo   New code (added functionality if plant_type === individual add that user to EntityMaster and gsai_user)
const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const pool = require("../../db");
const router = express.Router();

require("dotenv").config({ path: __dirname + "/.env" });

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "team.solardl@antsai.in",
    pass: "TEamSOlarDL12301@",
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true,
});

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
    mobile_number = null,
    email_status,
    mail,
    EntityID,
    LoginEntityID,
  } = req.body;

  if (!plant_id) {
    return res.status(400).json({ message: "plant_id is required." });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if email already exists in gsai_user table
    const [existingUser] = await connection.query(
      "SELECT email FROM gsai_user WHERE email = ?",
      [owner_email]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message:
          "Email already exists in the system. Please use a different email address.",
      });
    }

    // Insert plant details into Gsai_PlantMaster
    await connection.query(
      `INSERT INTO Gsai_PlantMaster (
        plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
        plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
        address_line2, pincode, longitude, latitude, owner_first_name,
        owner_last_name, owner_email, mobileno
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
        mobile_number,
      ]
    );

    let userIdsToLink = [];

    // Handle individual plant type and insert records into EntityMaster and gsai_user
    if (plant_type.toLowerCase() === "individual") {
      let newEntityId = `${owner_first_name}${owner_last_name}`
        .replace(/\s+/g, "")
        .toUpperCase();
      let suffix = 1001;

      // Generate unique entityid
      while (true) {
        const [existingEntity] = await connection.query(
          "SELECT entityid FROM EntityMaster WHERE entityid = ?",
          [`${newEntityId}-${suffix}`]
        );
        if (existingEntity.length === 0) {
          newEntityId = `${newEntityId}-${suffix}`;
          break;
        }
        suffix++;
      }

      // Insert into EntityMaster
      await connection.query(
        `INSERT INTO EntityMaster (
          entityid, entityname, category, contactfirstname, contactlastname, email, mobile,
          country, state, district, pincode, namespace, creation_date, last_update_date, mark_deletion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'gsai.greentek', NOW(), NOW(), 0)`,
        [
          newEntityId,
          `${owner_first_name} ${owner_last_name}`,
          plant_category,
          owner_first_name,
          owner_last_name,
          owner_email,
          mobile_number,
          country,
          state,
          district,
          pincode,
        ]
      );

      // Generate new user_id and hash the default password
      const newUserId = uuidv4();
      const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);

      // Insert into gsai_user
      await connection.query(
        `INSERT INTO gsai_user (
          user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number,
          pin_code, country, entity_name, user_role, otp_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 1)`,
        [
          newUserId,
          newEntityId,
          owner_first_name,
          owner_last_name,
          owner_email,
          hashedPassword,
          mobile_number || "0000000000",
          pincode,
          country,
          `${owner_first_name} ${owner_last_name}`,
        ]
      );

      // Link the user to the plant
      await connection.query(
        "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)",
        [plant_id, newUserId]
      );

      // Add owner to email notification list
      userIdsToLink.push({
        userId: newUserId,
        email: owner_email,
      });
    }

    // Handle notification emails based on email_status and mail
    if (email_status === 1 && mail === 2) {
      console.log("Condition 1: Email exists, sending two emails...");
      const [selectedEntityUser] = await connection.query(
        "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
        [EntityID]
      );

      if (selectedEntityUser && selectedEntityUser.length > 0) {
        userIdsToLink.push({
          userId: selectedEntityUser[0].user_id,
          email: selectedEntityUser[0].email,
        });

        console.log("Sending emails for email_status: 1, mail: 2...");
        await Promise.all([
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: selectedEntityUser[0].email,
            subject: "Plant Added Notification",
            text: `The plant ${plant_name} has been added with a user as individual.`,
          }),
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: owner_email,
            subject: "Plant Added",
            text: `You have been added as an individual user for the plant ${plant_name}.`,
          }),
        ]);
      }
    } else if (email_status === 2 && mail === 3) {
      console.log("Condition 2: Email exists, sending three emails...");

      const [loginEntityUser] = await connection.query(
        "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
        [LoginEntityID]
      );

      const [selectedEntityUser] = await connection.query(
        "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
        [EntityID]
      );

      // Collect valid email recipients
      const emailPromises = [];

      // Only add users to linking array and email list if they exist
      if (loginEntityUser && loginEntityUser.length > 0) {
        userIdsToLink.push({
          userId: loginEntityUser[0].user_id,
          email: loginEntityUser[0].email,
        });

        emailPromises.push(
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: loginEntityUser[0].email,
            subject: "Plant Added Notification",
            text: `The plant ${plant_name} has been added.`,
          })
        );
      }

      if (selectedEntityUser && selectedEntityUser.length > 0) {
        userIdsToLink.push({
          userId: selectedEntityUser[0].user_id,
          email: selectedEntityUser[0].email,
        });

        emailPromises.push(
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: selectedEntityUser[0].email,
            subject: "Plant Added Notification",
            text: `The plant ${plant_name} has been added with a user as individual.`,
          })
        );
      }

      // Always send email to the owner
      emailPromises.push(
        transporter.sendMail({
          from: process.env.SMTP_USER,
          to: owner_email,
          subject: "Plant Added",
          text: `You have been added as an individual user for the plant ${plant_name}.`,
        })
      );

      console.log("Sending emails for email_status: 2, mail: 3...");
      await Promise.all(emailPromises);
    } else if (email_status === 3 && mail === 2) {
      console.log("Condition 3: Email does not exist, sending two emails...");
      const [loginEntityUser] = await connection.query(
        "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
        [LoginEntityID]
      );

      const emailPromises = [];

      if (loginEntityUser && loginEntityUser.length > 0) {
        userIdsToLink.push({
          userId: loginEntityUser[0].user_id,
          email: loginEntityUser[0].email,
        });

        emailPromises.push(
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: loginEntityUser[0].email,
            subject: "Plant Added Notification",
            text: `The plant ${plant_name} has been added.`,
          })
        );
      }

      emailPromises.push(
        transporter.sendMail({
          from: process.env.SMTP_USER,
          to: owner_email,
          subject: "Plant Added",
          text: `You have been added as an individual user for the plant ${plant_name}.`,
        })
      );

      console.log("Sending emails for email_status: 3, mail: 2...");
      await Promise.all(emailPromises);
    } else if (email_status === 4 && mail === 3) {
      console.log("Condition 4: Email does not exist, sending three emails...");

      const [loginEntityUser] = await connection.query(
        "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
        [LoginEntityID]
      );

      const [selectedEntityUser] = await connection.query(
        "SELECT user_id, email FROM gsai_user WHERE entityid = ? LIMIT 1;",
        [EntityID]
      );

      const emailPromises = [];

      if (loginEntityUser && loginEntityUser.length > 0) {
        userIdsToLink.push({
          userId: loginEntityUser[0].user_id,
          email: loginEntityUser[0].email,
        });

        emailPromises.push(
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: loginEntityUser[0].email,
            subject: "Plant Added Notification",
            text: `The plant ${plant_name} has been added.`,
          })
        );
      }

      if (selectedEntityUser && selectedEntityUser.length > 0) {
        userIdsToLink.push({
          userId: selectedEntityUser[0].user_id,
          email: selectedEntityUser[0].email,
        });

        emailPromises.push(
          transporter.sendMail({
            from: process.env.SMTP_USER,
            to: selectedEntityUser[0].email,
            subject: "Plant Added Notification",
            text: `The plant ${plant_name} has been added with a user as individual.`,
          })
        );
      }

      emailPromises.push(
        transporter.sendMail({
          from: process.env.SMTP_USER,
          to: owner_email,
          subject: "Plant Added",
          text: `You have been added as an individual user for the plant ${plant_name}.`,
        })
      );

      console.log("Sending emails for email_status: 4, mail: 3...");
      await Promise.all(emailPromises);
    }

    // Link users to the plant
    console.log("Linking users to the plant in Gsai_PlantUser...");
    for (const { userId } of userIdsToLink) {
      await connection.query(
        "INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?);",
        [plant_id, userId]
      );
    }

    await connection.commit();
    console.log("Transaction committed successfully.");
    res
      .status(201)
      .json({ message: "Plant and user(s) linked successfully", plant_id });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding plant:", error);
    res.status(500).json({
      message: "Error adding plant",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

// const express = require("express");
// const pool = require("../../db"); // Ensure this points to your database connection file
// const router = express.Router();

// router.post("/updatePlant", async (req, res) => {
//   const {
//     "Plant ID": plant_id,
//     "Entity ID": entityid,
//     "Plant Name": plant_name,
//     "Install Date": install_date,
//     "Azimuth Angle": azimuth_angle,
//     "Tilt Angle": tilt_angle,
//     "Plant Type": plant_type,
//     "Plant Category": plant_category,
//     Capacity: capacity,
//     "Capacity Unit": capacity_unit,
//     Country: country,
//     Region: region,
//     State: state,
//     District: district,
//     "Address Line 1": address_line_1,
//     "Address Line 2": address_line_2,
//     Pincode: pincode,
//     Longitude: longitude,
//     Latitude: latitude,
//     "Data Logger": data_logger,
//     Inverter: inverter,
//     "Owner First Name": owner_first_name,
//     "Owner Last Name": owner_last_name,
//     "Owner Email": owner_email,
//     "Mobile Number": mobileno,
//     "Entity Name": entityname,
//   } = req.body;

//   // Validate required field
//   if (!plant_id) {
//     return res.status(400).json({ message: "Plant ID is required" });
//   }
//   // todo email token
//   let email_token = await bcrypt.hash(owner_email,10)

//   try {
//     // Update all fields in the database
//     const [updateResult] = await pool.query(
//       `
//       UPDATE Gsai_PlantMaster
//       SET
//         entityid = ?,
//         plant_name = ?,
//         install_date = ?,
//         azimuth_angle = ?,
//         tilt_angle = ?,
//         plant_type = ?,
//         plant_category = ?,
//         capacity = ?,
//         capacity_unit = ?,
//         country = ?,
//         region = ?,
//         state = ?,
//         district = ?,
//         address_line1 = ?,
//         address_line2 = ?,
//         pincode = ?,
//         longitude = ?,
//         latitude = ?,
//         data_logger = ?,
//         inverter = ?,
//         owner_first_name = ?,
//         owner_last_name = ?,
//         owner_email = ?,
//         mobileno = ?,
//         entityname = ?,
//         token = ?
//       WHERE plant_id = ?
//       `,
//       [
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
//         address_line_1,
//         address_line_2,
//         pincode,
//         longitude,
//         latitude,
//         data_logger,
//         inverter,
//         owner_first_name,
//         owner_last_name,
//         owner_email,
//         mobileno,
//         entityname,
//         plant_id, // Ensure this is passed as the last parameter
//       ]
//     );

//     // Check if the plant was updated
//     if (updateResult.affectedRows === 0) {
//       return res
//         .status(404)
//         .json({ message: "Plant not found or no changes made" });
//     }

//     // Respond with a success message
//     res.status(200).json({ message: `Plant ${plant_id} updated successfully` });
//   } catch (error) {
//     console.error("Error updating plant details:", error);
//     res.status(500).json({
//       message: "Error updating plant details",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const router = express.Router();

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Hostinger's SMTP server
  port: 465, // Port for SSL
  secure: true, // Use SSL
  auth: {
    user: "team.solardl@antsai.in", // Your email account
    pass: "TEamSOlarDL12301@", // Your email password
  },
});

router.post("/updatePlant", async (req, res) => {
  const {
    "Plant ID": plant_id,
    "Entity ID": entityid,
    "Plant Name": plant_name,
    "Install Date": install_date,
    "Azimuth Angle": azimuth_angle,
    "Tilt Angle": tilt_angle,
    "Plant Type": plant_type,
    "Plant Category": plant_category,
    Capacity: capacity,
    "Capacity Unit": capacity_unit,
    Country: country,
    Region: region,
    State: state,
    District: district,
    "Address Line 1": address_line_1,
    "Address Line 2": address_line_2,
    Pincode: pincode,
    Longitude: longitude,
    Latitude: latitude,
    "Data Logger": data_logger,
    Inverter: inverter,
    "Owner First Name": owner_first_name,
    "Owner Last Name": owner_last_name,
    "Owner Email": owner_email,
    "Mobile Number": mobileno,
    "Entity Name": entityname,
  } = req.body;

  // Validate required field
  if (!plant_id) {
    return res.status(400).json({ message: "Plant ID is required" });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Fetch current email from the database
    const [existingPlant] = await connection.query(
      "SELECT owner_email FROM Gsai_PlantMaster WHERE plant_id = ?",
      [plant_id]
    );

    if (existingPlant.length === 0) {
      return res.status(404).json({ message: "Plant not found" });
    }

    const oldEmail = existingPlant[0].owner_email;
    const emailChanged = oldEmail !== owner_email;

    if (emailChanged) {
      // Generate an email token for security
      const emailToken = await bcrypt.hash(owner_email, 10);

      // Update the database with the new email and set a token
      await connection.query(
        `
          UPDATE Gsai_PlantMaster
          SET 
            entityid = ?,
            plant_name = ?,
            install_date = ?,
            azimuth_angle = ?,
            tilt_angle = ?,
            plant_type = ?,
            plant_category = ?,
            capacity = ?,
            capacity_unit = ?,
            country = ?,
            region = ?,
            state = ?,
            district = ?,
            address_line1 = ?,
            address_line2 = ?,
            pincode = ?,
            longitude = ?,
            latitude = ?,
            data_logger = ?,
            inverter = ?,
            owner_first_name = ?,
            owner_last_name = ?,
            owner_email = ?,
            mobileno = ?,
            entityname = ?,
            email_token = ?
          WHERE plant_id = ?
        `,
        [
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
          address_line_1,
          address_line_2,
          pincode,
          longitude,
          latitude,
          data_logger,
          inverter,
          owner_first_name,
          owner_last_name,
          owner_email,
          mobileno,
          entityname,
          emailToken,
          plant_id,
        ]
      );

      // Send email notification
      const mailOptions = {
        from: "team.solardl@antsai.in",
        to: owner_email,
        subject: "Your Plant Details Have Been Updated",
        text: `Dear ${owner_first_name} ${owner_last_name},

Your plant details have been successfully updated. If this email address change was not authorized by you, please contact our support immediately.

To access your account, please use the following link:
https://testsolardl.antsai.in/login

Best regards,  
Team GSAI`,
      };

      await transporter.sendMail(mailOptions);
    } else {
      // Update all fields without triggering an email notification
      await connection.query(
        `
          UPDATE Gsai_PlantMaster
          SET 
            entityid = ?,
            plant_name = ?,
            install_date = ?,
            azimuth_angle = ?,
            tilt_angle = ?,
            plant_type = ?,
            plant_category = ?,
            capacity = ?,
            capacity_unit = ?,
            country = ?,
            region = ?,
            state = ?,
            district = ?,
            address_line1 = ?,
            address_line2 = ?,
            pincode = ?,
            longitude = ?,
            latitude = ?,
            data_logger = ?,
            inverter = ?,
            owner_first_name = ?,
            owner_last_name = ?,
            mobileno = ?,
            entityname = ?
          WHERE plant_id = ?
        `,
        [
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
          address_line_1,
          address_line_2,
          pincode,
          longitude,
          latitude,
          data_logger,
          inverter,
          owner_first_name,
          owner_last_name,
          mobileno,
          entityname,
          plant_id,
        ]
      );
    }

    await connection.commit();

    res.status(200).json({
      message: `Plant ${plant_id} updated successfully`,
      emailChanged,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error updating plant details:", error);
    res.status(500).json({
      message: "Error updating plant details",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

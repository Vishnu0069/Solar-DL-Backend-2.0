const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const pool = require("../../db");
const router = express.Router();
const auth = require("../../middleware/auth");

require("dotenv").config({ path: __dirname + "/.env" });

// Configure nodemailer transporter
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

// Edit Plant API
router.put("/editPlant", auth, async (req, res) => {
  const {
    plant_id, // Required for identifying the plant to edit
    plant_name, // Editable
    install_date, // Editable
    azimuth_angle, // Editable
    tilt_angle, // Editable
    plant_type, // Editable
    plant_category, // Editable
    capacity, // Editable
    capacity_unit, // Editable
    address_line1, // Editable
    address_line2, // Editable
    longitude, // Editable
    latitude, // Editable
    yield_value, // Editable
    currency, // Editable
    timezone, // Editable
    owner_first_name,  // Editable
    owner_last_name,   // Editable
    owner_email,       // Editable
    mobileNumber = null, // Editable
    EntityID,          // Editable
    LoginEntityID      // Editable
  } = req.body;

  // Validate required field
  if (!plant_id) {
    return res
      .status(400)
      .json({ message: "Missing required field: plant_id." });
  }

  let connection;

  try {
    connection = await pool.getConnection();

    // Check if the plant exists
    const [existingPlant] = await connection.query(
      "SELECT plant_id FROM Gsai_PlantMaster WHERE plant_id = ?",
      [plant_id]
    );

    if (existingPlant.length === 0) {
      return res
        .status(404)
        .json({ message: `Plant with ID '${plant_id}' not found.` });
    }

    // Update only editable plant details
    const sql = `
      UPDATE Gsai_PlantMaster
      SET
        plant_name = COALESCE(?, plant_name),
        install_date = COALESCE(?, install_date),
        azimuth_angle = COALESCE(?, azimuth_angle),
        tilt_angle = COALESCE(?, tilt_angle),
        plant_type = COALESCE(?, plant_type),
        plant_category = COALESCE(?, plant_category),
        capacity = COALESCE(?, capacity),
        capacity_unit = COALESCE(?, capacity_unit),
        address_line1 = COALESCE(?, address_line1),
        address_line2 = COALESCE(?, address_line2),
        longitude = COALESCE(?, longitude),
        latitude = COALESCE(?, latitude),
        yield_value = COALESCE(?, yield_value),
        currency = COALESCE(?, currency),
        timezone = COALESCE(?, timezone)
      WHERE plant_id = ?;
    `;

    const result = await connection.query(sql, [
      plant_name,
      install_date,
      azimuth_angle,
      tilt_angle,
      plant_type,
      plant_category,
      capacity,
      capacity_unit,
      address_line1,
      address_line2,
      longitude,
      latitude,
      yield_value,
      currency,
      timezone,
      plant_id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ message: `Failed to update plant with ID '${plant_id}'.` });
    }

    // Send email notification
    if (owner_email) {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: owner_email,
        subject: "Plant Details Updated",
        text: `The details of the plant with ID '${plant_id}' have been updated successfully.`,
        html: `<p>The details of the plant with ID <strong>${plant_id}</strong> have been updated successfully.</p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent successfully:", info.response);
        }
      });
    }

    res.status(200).json({
      message: `Plant with ID '${plant_id}' updated successfully.`,
    });
  } catch (error) {
    console.error("Error updating plant:", error);
    res.status(500).json({
      message: "Error updating plant.",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

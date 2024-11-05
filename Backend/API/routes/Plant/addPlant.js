const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const pool = require('../../db');
const router = express.Router();
require('dotenv').config();

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'team.solardl@antsai.in',
    pass: 'TEamSOlarDL12301#'
  }
});

router.post('/addPlant', async (req, res) => {
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
    mobile_number = null
  } = req.body;

  if (!plant_id) {
    return res.status(400).json({ message: 'plant_id is required.' });
  }

  try {
    // Insert plant details into Gsai_PlantMaster
    await pool.query(
      `INSERT INTO Gsai_PlantMaster (
        plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type, 
        plant_category, capacity, capacity_unit, country, region, state, district, address_line1, 
        address_line2, pincode, longitude, latitude, data_logger, inverter, owner_first_name, 
        owner_last_name, owner_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
        plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
        address_line2, pincode, longitude, latitude, data_logger, inverter, owner_first_name,
        owner_last_name, owner_email
      ]
    );

    let newEntityId = entityid;
    let suffix = 1001;
    let user_id;

    if (plant_type.toLowerCase() === "individual") {
      // Generate a unique entityid
      const baseEntityId = entityid.split('-')[0];

      while (true) {
        newEntityId = `${baseEntityId}-${suffix}`;
        const [existingEntity] = await pool.query(
          'SELECT entityid FROM EntityMaster WHERE entityid = ?',
          [newEntityId]
        );
        if (existingEntity.length === 0) break;
        suffix += 1;
      }

      // Insert into EntityMaster
      await pool.query(
        `INSERT INTO EntityMaster (entityid, entityname, category, contactfirstname, 
          contactlastname, email, mobile, country, state, district, pincode, 
          namespace, creation_date, last_update_date, mark_deletion) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'gsai.greentek', NOW(), NOW(), 0)`,
        [newEntityId, plant_name, plant_category, owner_first_name, owner_last_name, owner_email, mobile_number, country, state, district, pincode]
      );

      // Hash default password and insert user
      const hashedPassword = await bcrypt.hash("DefaultPass@123", 10);
      const [userResult] = await pool.query(
        `INSERT INTO gsai_user (
          user_id, entityid, first_name, last_name, email, passwordhashcode, mobile_number, 
          pin_code, country, entity_name, user_role, otp_status
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'individual', 1)`,
        [
          newEntityId, owner_first_name, owner_last_name, owner_email, hashedPassword,
          mobile_number || '0000000000', pincode, country, plant_name
        ]
      );

      // Get user_id for the new user
      user_id = userResult.insertId;

      // Insert into Gsai_PlantUser
      await pool.query(
        'INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)',
        [plant_id, user_id]
      );

      const mailOptions = {
        from: 'team.solardl@antsai.in',
        to: owner_email,
        subject: 'New Individual User Created for Plant',
        text: `
Dear ${owner_first_name} ${owner_last_name},

You have been added as an individual user for the plant ${plant_name} with EntityID: ${newEntityId}.

Your default password is DefaultPass@123.

Please log in with the above credentials.

Best regards,
Team GSAI`
      };
      await transporter.sendMail(mailOptions);

    } else {
      const [sysadminUser] = await pool.query('SELECT user_id FROM gsai_user WHERE entityid = ?', [entityid]);
      if (sysadminUser.length === 0) {
        return res.status(404).json({ message: 'Sysadmin user not found for the given entity ID.' });
      }
      user_id = sysadminUser[0].user_id;

      await pool.query(
        'INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)',
        [plant_id, user_id]
      );
    }

    res.status(201).json({ message: 'Plant and user linked successfully', plant_id });
  } catch (error) {
    console.error('Error adding plant:', error);
    res.status(500).json({ message: 'Error adding plant', error: error.message });
  }
});

module.exports = router;

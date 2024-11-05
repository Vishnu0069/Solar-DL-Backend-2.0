const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/addPlant', async (req, res) => {
  const {
    plant_id, // Now expecting plant_id directly from the request
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
    owner_email
  } = req.body;

  if (!plant_id) {
    return res.status(400).json({ message: 'plant_id is required.' });
  }

  try {
    // Step 1: Insert the provided plant_id and other details into Gsai_PlantMaster
    await pool.query(
      `INSERT INTO Gsai_PlantMaster (
        plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type, 
        plant_category, capacity, capacity_unit, country, region, state, district, address_line1, 
        address_line2, pincode, longitude, latitude, data_logger, inverter, owner_first_name, 
        owner_last_name, owner_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plant_id, entityid, plant_name, install_date, azimuth_angle, tilt_angle, plant_type,
        plant_category, capacity, capacity_unit, country, region, state, district, address_line1,
        address_line2, pincode, longitude, latitude, data_logger, inverter, owner_first_name,
        owner_last_name, owner_email
      ]
    );

    // Step 2: Find user_id associated with the entityid in gsai_user
    const [user] = await pool.query('SELECT user_id FROM gsai_user WHERE entityid = ?', [entityid]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found for the given entity ID.' });
    }

    const user_id = user[0].user_id;

    // Step 3: Insert into Gsai_PlantUser to link the plant and user
    await pool.query(
      'INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES (?, ?)',
      [plant_id, user_id]
    );

    res.status(201).json({ message: 'Plant added successfully', plant_id });
  } catch (error) {
    console.error('Error adding plant:', error);
    res.status(500).json({ message: 'Error adding plant', error: error.message });
  }
});

module.exports = router;

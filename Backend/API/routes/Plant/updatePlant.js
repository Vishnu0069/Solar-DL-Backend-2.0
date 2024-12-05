const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

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
  } = req.body;

  // Validate required field
  if (!plant_id) {
    return res.status(400).json({ message: "Plant ID is required" });
  }

  try {
    // Update all fields in the database
    const [updateResult] = await pool.query(
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
        mobileno = ?
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
        plant_id, // Ensure this is passed as the last parameter
      ]
    );

    // Check if the plant was updated
    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Plant not found or no changes made" });
    }

    // Respond with a success message
    res.status(200).json({ message: `Plant ${plant_id} updated successfully` });
  } catch (error) {
    console.error("Error updating plant details:", error);
    res.status(500).json({
      message: "Error updating plant details",
      error: error.message,
    });
  }
});

module.exports = router;

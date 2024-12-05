const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

router.post("/updatePlant", async (req, res) => {
  const {
    plant_id,
    plant_name,
    plant_type,
    plant_category,
    capacity,
    capacity_unit,
    country,
    region,
    state,
    district,
    pincode,
    longitude,
    latitude,
    install_date,
    azimuth_angle,
    tilt_angle,
    owner_first_name,
    owner_last_name,
    owner_email,
  } = req.body;

  // Validate input
  if (!plant_id) {
    return res.status(400).json({ message: "plant_id is required" });
  }

  try {
    // Query to update the plant details
    const [updateResult] = await pool.query(
      `
      UPDATE Gsai_PlantMaster
      SET 
        plant_name = ?,
        plant_type = ?,
        plant_category = ?,
        capacity = ?,
        capacity_unit = ?,
        country = ?,
        region = ?,
        state = ?,
        district = ?,
        pincode = ?,
        longitude = ?,
        latitude = ?,
        install_date = ?,
        azimuth_angle = ?,
        tilt_angle = ?,
        owner_first_name = ?,
        owner_last_name = ?,
        owner_email = ?
      WHERE plant_id = ?
      `,
      [
        plant_name,
        plant_type,
        plant_category,
        capacity,
        capacity_unit,
        country,
        region,
        state,
        district,
        pincode,
        longitude,
        latitude,
        install_date,
        azimuth_angle,
        tilt_angle,
        owner_first_name,
        owner_last_name,
        owner_email,
        plant_id,
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

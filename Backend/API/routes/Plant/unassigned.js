const express = require("express");
const pool = require("../../db"); // Database connection
const router = express.Router();
//test
router.get("/unassignedPlants/:entityid", async (req, res) => {
  const { entityid } = req.params;

  try {
    // Step 1: Get all plants for the given entityid
    const [allPlants] = await pool.query(
      `SELECT plant_id
       FROM Gsai_PlantMaster
       WHERE entityid = ?;`,
      [entityid]
    );

    if (allPlants.length === 0) {
      return res
        .status(404)
        .json({ message: "No plants found for the given entity ID." });
    }

    const allPlantIds = allPlants.map((plant) => plant.plant_id);

    // Step 2: Get all user IDs with the role 'plant manager' and user type 'entity_user' under the entityid
    const [plantManagers] = await pool.query(
      `SELECT user_id
       FROM gsai_user
       WHERE entityid = ? AND user_role = 'plant manager' AND user_type = 'entity_user';`,
      [entityid]
    );

    if (plantManagers.length === 0) {
      return res.status(200).json(allPlants); // If no managers, all plants are unassigned
    }

    const plantManagerIds = plantManagers.map((manager) => manager.user_id);

    // Step 3: Get all plant IDs assigned to the plant managers
    const [assignedPlants] = await pool.query(
      `SELECT DISTINCT plant_id
       FROM Gsai_PlantUser
       WHERE user_id IN (?);`,
      [plantManagerIds]
    );

    const assignedPlantIds = assignedPlants.map((plant) => plant.plant_id);

    // Step 4: Get unassigned plants by subtracting assigned plant IDs from all plant IDs
    const unassignedPlantIds = allPlantIds.filter(
      (plantId) => !assignedPlantIds.includes(plantId)
    );

    if (unassignedPlantIds.length === 0) {
      return res.status(200).json({ message: "No unassigned plants found." });
    }

    // Step 5: Fetch details of unassigned plants
    const [unassignedPlants] = await pool.query(
      `SELECT 
         plant_id AS "Plant ID",
         plant_name AS "Plant Name",
         plant_type AS "Plant Type",
         plant_category AS "Plant Category",
         capacity AS "Capacity",
         capacity_unit AS "Capacity Unit",
         country AS "Country",
         region AS "Region",
         state AS "State",
         district AS "District",
         pincode AS "Pincode",
         longitude AS "Longitude",
         latitude AS "Latitude",
         install_date AS "Install Date",
         azimuth_angle AS "Azimuth Angle",
         tilt_angle AS "Tilt Angle",
         owner_first_name AS "Owner First Name",
         owner_last_name AS "Owner Last Name",
         owner_email AS "Owner Email",
         mobileno AS "Mobile Number",
         entityname AS "Entity Name"
       FROM Gsai_PlantMaster
       WHERE plant_id IN (?);`,
      [unassignedPlantIds]
    );

    res.status(200).json(unassignedPlants);
  } catch (error) {
    console.error("Error fetching unassigned plants:", error);
    res.status(500).json({
      message: "Error fetching unassigned plants",
      error: error.message,
    });
  }
});

module.exports = router;

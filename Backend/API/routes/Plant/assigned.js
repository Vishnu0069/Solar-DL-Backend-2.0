// const express = require("express");
// const pool = require("../../db"); // Database connection
// const router = express.Router();

// router.get("/getAssignedPlants/:entityid", async (req, res) => {
//   const { entityid } = req.params;

//   try {
//     // Step 1: Fetch users with the given entityid, user_type = 'entityuser', and role = 'plant manager'
//     const [users] = await pool.query(
//       `SELECT user_id
//        FROM gsai_user
//        WHERE entityid = ? AND user_type = 'entity_user' AND user_role = 'plant manager';`,
//       [entityid]
//     );

//     if (users.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No plant managers found for the given entity ID." });
//     }

//     const userIds = users.map((user) => user.user_id);

//     // Step 2: Fetch plant IDs assigned to the fetched user IDs from Gsai_PlantUser table
//     const [plantUsers] = await pool.query(
//       `SELECT DISTINCT plant_id
//        FROM Gsai_PlantUser
//        WHERE user_id IN (?);`,
//       [userIds]
//     );

//     if (plantUsers.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No assigned plants found for the given entity ID." });
//     }

//     const plantIds = plantUsers.map((plantUser) => plantUser.plant_id);

//     // Step 3: Fetch plant details from Gsai_PlantMaster table using the plant IDs
//     const [plants] = await pool.query(
//       `SELECT
//          plant_id AS "Plant ID",
//          plant_name AS "Plant Name",
//          plant_type AS "Plant Type",
//          plant_category AS "Plant Category",
//          capacity AS "Capacity",
//          capacity_unit AS "Capacity Unit",
//          country AS "Country",
//          region AS "Region",
//          state AS "State",
//          district AS "District",
//          pincode AS "Pincode",
//          longitude AS "Longitude",
//          latitude AS "Latitude",
//          install_date AS "Install Date",
//          azimuth_angle AS "Azimuth Angle",
//          tilt_angle AS "Tilt Angle",
//          owner_first_name AS "Owner First Name",
//          owner_last_name AS "Owner Last Name",
//          owner_email AS "Owner Email",
//          mobileno AS "Mobile Number",
//          entityname AS "Entity Name",
//          'Assigned' AS "Assignment Status"
//        FROM Gsai_PlantMaster
//        WHERE plant_id IN (?);`,
//       [plantIds]
//     );

//     if (plants.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No plant details found for the assigned plants." });
//     }

//     // Step 4: Return the list of plants
//     res.status(200).json(plants);
//   } catch (error) {
//     console.error("Error fetching assigned plants:", error);
//     res.status(500).json({
//       message: "Error fetching assigned plants",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const pool = require("../../db"); // Database connection
const router = express.Router();

router.get("/getAssignedPlants/:entityid", async (req, res) => {
  const { entityid } = req.params;

  try {
    // Step 1: Fetch users with the given entityid, user_type = 'entity_user', and role = 'plant manager'
    const [users] = await pool.query(
      `SELECT user_id 
       FROM gsai_user 
       WHERE entityid = ? AND user_type = 'entity_user' AND user_role = 'plant manager';`,
      [entityid]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No plant managers found for the given entity ID." });
    }

    const userIds = users.map((user) => user.user_id);

    // Step 2: Fetch plant IDs assigned to the fetched user IDs from Gsai_PlantUser table
    const [plantUsers] = await pool.query(
      `SELECT DISTINCT plant_id 
       FROM Gsai_PlantUser 
       WHERE user_id IN (?);`,
      [userIds]
    );

    if (plantUsers.length === 0) {
      return res
        .status(404)
        .json({ message: "No assigned plants found for the given entity ID." });
    }

    const plantIds = plantUsers.map((plantUser) => plantUser.plant_id);

    // Step 3: Fetch plant details from Gsai_PlantMaster table using the plant IDs
    const [plants] = await pool.query(
      `SELECT DISTINCT 
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
         entityname AS "Entity Name",
         'Assigned' AS "Assignment Status"
       FROM Gsai_PlantMaster
       WHERE plant_id IN (?);`,
      [plantIds]
    );

    if (plants.length === 0) {
      return res
        .status(404)
        .json({ message: "No plant details found for the assigned plants." });
    }

    // Step 4: Return the list of plants
    res.status(200).json(plants);
  } catch (error) {
    console.error("Error fetching assigned plants:", error);
    res.status(500).json({
      message: "Error fetching assigned plants",
      error: error.message,
    });
  }
});

module.exports = router;

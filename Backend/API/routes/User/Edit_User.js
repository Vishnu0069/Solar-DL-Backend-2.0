// const express = require('express');
// const pool = require('../../db');
// const router = express.Router();

// router.post('/updateUser', async (req, res) => {
//   const {
//     userid,
//     entityid,
//     firstName,
//     lastName,
//     mobileNo,
//     role,
//     disableUser,
//     plantIds  // Optional: Array of plant IDs to link with the user
//   } = req.body;

//   if (!userid || !entityid || !firstName || !lastName || !mobileNo || !role) {
//     return res.status(400).json({ message: 'All fields are required except plant IDs array' });
//   }

//   let connection;

//   try {
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     // Step 1: Update user details, handling any potential null values
//     await connection.query(
//       `UPDATE gsai_user
//        SET first_name = COALESCE(?, first_name),
//            last_name = COALESCE(?, last_name),
//            mobile_number = COALESCE(?, mobile_number),
//            user_role = COALESCE(?, user_role),
//            delete_flag = ?
//        WHERE user_id = ? AND entityid = ?`,
//       [
//         firstName,
//         lastName,
//         mobileNo,
//         role,
//         disableUser ? 1 : 0,
//         userid,
//         entityid
//       ]
//     );

//     // Step 2: Delete all existing plant-user associations for the user
//     await connection.query(
//       `DELETE FROM Gsai_PlantUser WHERE user_id = ?`,
//       [userid]
//     );

//     // Step 3: Insert new plant-user associations if plantIds is provided and not empty
//     if (Array.isArray(plantIds) && plantIds.length > 0) {
//       const plantUserRecords = plantIds.map(plantId => [plantId, userid]);
//       await connection.query(
//         `INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES ?`,
//         [plantUserRecords]
//       );
//     }

//     await connection.commit();
//     res.status(200).json({ message: 'User and plant associations updated successfully' });
//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error('Error updating user and plant associations:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// module.exports = router;

//Below is the one with Updated UserType

const express = require("express");
const pool = require("../../db");
const router = express.Router();

router.post("/updateUser", async (req, res) => {
  const {
    userid,
    entityid,
    firstName,
    lastName,
    mobileNo,
    role,
    //email, // You may also want to update the email field.
    disableUser,
    userType, // Added userType
    plantIds, // Optional: Array of plant IDs to link with the user
  } = req.body;

  // Check if required fields are provided
  if (
    !userid ||
    !entityid ||
    !firstName ||
    !lastName ||
    !mobileNo ||
    !role ||
    userType === undefined
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required except plant IDs array" });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Step 1: Update user details, handling any potential null values
    await connection.query(
      `UPDATE gsai_user 
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           mobile_number = COALESCE(?, mobile_number),
           user_role = COALESCE(?, user_role),
           user_type = COALESCE(?, user_type),  
           
           delete_flag = ?
       WHERE user_id = ? AND entityid = ?`,
      [
        firstName,
        lastName,
        mobileNo,
        role,
        userType, // Include userType in the query

        disableUser ? 1 : 0,
        userid,
        entityid,
      ]
    );

    // Step 2: Delete all existing plant-user associations for the user
    await connection.query(`DELETE FROM Gsai_PlantUser WHERE user_id = ?`, [
      userid,
    ]);

    // Step 3: Insert new plant-user associations if plantIds is provided and not empty
    if (Array.isArray(plantIds) && plantIds.length > 0) {
      const plantUserRecords = plantIds.map((plantId) => [plantId, userid]);
      await connection.query(
        `INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES ?`,
        [plantUserRecords]
      );
    }

    await connection.commit();
    res
      .status(200)
      .json({ message: "User and plant associations updated successfully" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error updating user and plant associations:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

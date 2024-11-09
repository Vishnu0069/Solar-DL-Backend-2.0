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
//     disableUser
//   } = req.body;

//   if (!userid || !entityid || !firstName || !lastName || !mobileNo || !role) {
//     return res.status(400).json({ message: 'All fields are required except userid and email' });
//   }

//   try {
//     // Update user details except user_id and email
//     await pool.query(
//       `UPDATE gsai_user 
//        SET first_name = ?, last_name = ?, mobile_number = ?, user_role = ?, delete_flag = ?
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

//     res.status(200).json({ message: 'User updated successfully' });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });

// module.exports = router;
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/updateUser', async (req, res) => {
  const {
    userid,
    entityid,
    firstName,
    lastName,
    mobileNo,
    role,
    disableUser,
    plantIds  // Optional: Array of plant IDs to link with the user
  } = req.body;

  if (!userid || !entityid || !firstName || !lastName || !mobileNo || !role) {
    return res.status(400).json({ message: 'All fields are required except plant IDs array' });
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
           delete_flag = ?
       WHERE user_id = ? AND entityid = ?`,
      [
        firstName,
        lastName,
        mobileNo,
        role,
        disableUser ? 1 : 0,
        userid,
        entityid
      ]
    );

    // Step 2: Clear existing plant-user associations for the user if plantIds is provided
    if (Array.isArray(plantIds) && plantIds.length > 0) {
      await connection.query(
        `DELETE FROM Gsai_PlantUser WHERE user_id = ?`,
        [userid]
      );

      // Step 3: Insert new plant-user associations
      const plantUserRecords = plantIds.map(plantId => [plantId, userid]);
      await connection.query(
        `INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES ?`,
        [plantUserRecords]
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'User and plant associations updated successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating user and plant associations:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

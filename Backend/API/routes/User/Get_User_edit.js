// const express = require('express');
// const pool = require('../../db');
// const router = express.Router();

// router.get('/getUserDetails', async (req, res) => {
//   const { userid, entityid } = req.query;

//   if (!userid || !entityid) {
//     return res.status(400).json({ message: 'userid and entityid are required' });
//   }

//   try {
//     const [rows] = await pool.query(
//       `SELECT first_name AS firstName, last_name AS lastName, mobile_number AS mobileNo, user_role AS role, email, delete_flag AS disableUser
//        FROM gsai_user
//        WHERE user_id = ? AND entityid = ?`,
//       [userid, entityid]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const user = rows[0];
//     user.disableUser = user.disableUser === 1; // Convert delete_flag to boolean

//     res.status(200).json(user);
//   } catch (error) {
//     console.error('Error fetching user details:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });

// module.exports = router;

const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/getUserDetails', async (req, res) => {
  const { userid, entityid } = req.query;

  if (!userid || !entityid) {
    return res.status(400).json({ message: 'userid and entityid are required' });
  }

  try {
    // Query to get user details
    const [userRows] = await pool.query(
      `SELECT first_name AS firstName, last_name AS lastName, mobile_number AS mobileNo, 
              user_role AS role, email, delete_flag AS disableUser
       FROM gsai_user
       WHERE user_id = ? AND entityid = ?`,
      [userid, entityid]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];
    user.disableUser = user.disableUser === 1; // Convert delete_flag to boolean

    // Query to get all related plant IDs from Gsai_PlantUser table
    const [plantRows] = await pool.query(
      `SELECT plant_id 
       FROM Gsai_PlantUser
       WHERE user_id = ?`,
      [userid]
    );

    // Extract plant IDs as an array
    user.plantIds = plantRows.map(row => row.plant_id);

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

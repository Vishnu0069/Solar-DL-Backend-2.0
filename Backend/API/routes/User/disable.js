// const express = require('express');
// const pool = require('../../db');
// const router = express.Router();

// router.post('/disable', async (req, res) => {
//   const { userid } = req.body;

//   if (!userid) {
//     return res.status(400).json({ message: 'userid parameter is required' });
//   }

//   try {
//     // Fetch the masterentityid for the given userid
//     const [userResult] = await pool.query(
//       `SELECT masterentityid
//        FROM gsai_user
//        JOIN EntityMaster ON gsai_user.entityid = EntityMaster.entityid
//        WHERE gsai_user.user_id = ?`,
//       [userid]
//     );

//     if (userResult.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const masterEntityId = userResult[0].masterentityid;

//     // Check if the masterentityid is '1111', indicating sysadmin
//     if (masterEntityId === '1111') {
//       return res.status(403).json({ message: "Can't disable the sysadmin user" });
//     }

//     // Update the user to set the delete_flag to 1
//     const [result] = await pool.query(
//       `UPDATE gsai_user
//        SET delete_flag = 1
//        WHERE user_id = ?`,
//       [userid]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({ message: 'User disabled successfully' });
//   } catch (error) {
//     console.error('Error disabling user:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const pool = require("../../db");
const router = express.Router();
const auth = require("../../middleware/auth");

router.post("/disable", auth, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId parameter is required" });
  }

  try {
    // Fetch the user role for the given userId
    const [userResult] = await pool.query(
      `SELECT user_role 
       FROM gsai_user 
       WHERE user_id = ?`,
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = userResult[0].user_role;

    // Check if the user role is 'sysadmin'
    if (userRole === "sys admin") {
      return res.status(403).json({ message: "Can't disable a sysadmin user" });
    }

    // Update the user to set the delete_flag to 1
    const [result] = await pool.query(
      `UPDATE gsai_user 
       SET delete_flag = 1 
       WHERE user_id = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User disabled successfully" });
  } catch (error) {
    console.error("Error disabling user:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;

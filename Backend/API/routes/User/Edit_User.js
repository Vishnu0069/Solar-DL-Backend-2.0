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
    disableUser
  } = req.body;

  if (!userid || !entityid || !firstName || !lastName || !mobileNo || !role) {
    return res.status(400).json({ message: 'All fields are required except userid and email' });
  }

  try {
    // Update user details except user_id and email
    await pool.query(
      `UPDATE gsai_user 
       SET first_name = ?, last_name = ?, mobile_number = ?, user_role = ?, delete_flag = ?
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

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

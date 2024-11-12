// In routes/User/addUserGroups.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/addUserGroups', async (req, res) => {
  const { userId, groupName } = req.body;

  if (!userId || !groupName) {
    return res.status(400).json({ message: 'userId and groupName are required' });
  }

  try {
    // Insert user group without specifying user_group_id (it will auto-increment)
    const [result] = await pool.query(
      `INSERT INTO Gsai_User_Groups (user_id, group_name) VALUES (?, ?)`,
      [userId, groupName]
    );

    // Return the newly created auto-incremented user_group_id
    res.status(200).json({ message: 'User group added successfully', userGroupId: result.insertId });
  } catch (error) {
    console.error('Error adding user group:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

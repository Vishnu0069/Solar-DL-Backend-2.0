// In routes/User/addUserGroupPlant.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/addUserGroupPlant', async (req, res) => {
  const { userId, groupId, plantIds } = req.body;

  if (!userId || !groupId || !Array.isArray(plantIds)) {
    return res.status(400).json({ message: 'userId, groupId, and an array of plantIds are required' });
  }

  try {
    // Prepare the records to be inserted as an array of arrays
    const plantUserGroupRecords = plantIds.map(plantId => [userId, groupId, plantId]);

    // Insert multiple records in one query
    await pool.query(
      `INSERT INTO Gsai_User_Group_Plants (user_id, user_group_id, plant_id) VALUES ?`,
      [plantUserGroupRecords]
    );

    res.status(200).json({ message: 'Plants associated with user group successfully' });
  } catch (error) {
    console.error('Error associating plants with user group:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

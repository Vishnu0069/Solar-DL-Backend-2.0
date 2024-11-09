const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/updatePlantUserRelations', async (req, res) => {
  const { user_id, plant_ids } = req.body;

  if (!user_id || !plant_ids || !Array.isArray(plant_ids) || plant_ids.length === 0) {
    return res.status(400).json({ message: 'user_id and plant_ids are required, and plant_ids should be a non-empty array.' });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Step 1: Delete all existing records for this user in Gsai_PlantUser
    await connection.query('DELETE FROM Gsai_PlantUser WHERE user_id = ?', [user_id]);

    // Step 2: Insert new records for each plant ID under the specified user ID
    const insertValues = plant_ids.map(plant_id => [plant_id, user_id]);
    await connection.query('INSERT INTO Gsai_PlantUser (plant_id, user_id) VALUES ?', [insertValues]);

    await connection.commit();
    res.status(200).json({ message: 'Plant-user relationships updated successfully' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating plant-user relationships:', error);
    res.status(500).json({ message: 'Error updating plant-user relationships', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

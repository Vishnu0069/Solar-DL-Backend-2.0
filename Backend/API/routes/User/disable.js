const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/disable', async (req, res) => {
  const { userid } = req.body;

  if (!userid) {
    return res.status(400).json({ message: 'userid parameter is required' });
  }

  try {
    // Update the user to set the delete_flag to 1
    const [result] = await pool.query(
      `UPDATE gsai_user 
       SET delete_flag = 1 
       WHERE user_id = ?`,
      [userid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User disabled successfully' });
  } catch (error) {
    console.error('Error disabling user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

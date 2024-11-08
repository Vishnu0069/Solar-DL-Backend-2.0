const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/verify_individual_user', async (req, res) => {
  const { entityid, useremail } = req.body;

  if (!entityid || !useremail) {
    return res.status(400).json({ message: 'entityid and useremail parameters are required' });
  }

  try {
    // Step 1: Check if email already exists in the database
    const [userRows] = await pool.query('SELECT * FROM gsai_user WHERE email = ?', [useremail]);

    if (userRows.length === 0) {
      // Email does not exist, go ahead with verification
      return res.status(400).json({ message: 'Email not found, go ahead with verification' });
    }

    // Email exists, proceed with further checks
    const user = userRows[0];

    // Step 2: Check entityid and role conditions
    if (user.entityid === entityid && user.user_role === 'individual') {
      // The user has the same entity ID and role is "individual"
      return res.status(400).json({ message: 'Go ahead with verification, user already verified' });
    } else if (user.entityid !== entityid) {
      // The user has a different entity ID
      return res.status(300).json({ message: 'Duplicate email, use different email' });
    } else if (user.entityid === entityid && user.user_role !== 'individual') {
      // The user has the same entity ID but a different role
      return res.status(300).json({ message: 'Duplicate email, use different email id' });
    }

    // Default response if none of the above conditions are met (unexpected case)
    return res.status(200).json({ message: 'Unexpected error' });

  } catch (error) {
    console.error('Error verifying individual user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

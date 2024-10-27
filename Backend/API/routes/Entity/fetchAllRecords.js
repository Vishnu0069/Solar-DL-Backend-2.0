// In routes/Entity/fetchAllRecords.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.get('/fetchAllRecords', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        entityid AS id,
        entityname AS "Entity Name",
        contactfirstname AS "First Name",
        contactlastname AS "Last Name",
        email AS "Email Id",
        mobile AS "Mobile Number",
        namespace AS "Namespace",
        country AS "Country",
        state AS "State",
        district AS "District",
        pincode AS "Pincode"
      FROM EntityMaster
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Error fetching records', error: error.message });
  }
});

module.exports = router;

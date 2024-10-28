// In routes/Entity/editEntity.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.put('/edit', async (req, res) => {
  const { 
    entityid, entityname, category, contactfirstname, contactlastname, 
    email, mobile, country, state, district, pincode, 
    address_line_1 = null, address_line_2 = null, GSTIN = null, Region = null, disable = 0 
  } = req.body;

  if (!entityid) {
    return res.status(400).json({ message: 'Entity ID is required' });
  }

  try {
    // Base update query
    let updateQuery = `
      UPDATE EntityMaster 
      SET 
        entityname = ?, category = ?, contactfirstname = ?, contactlastname = ?, 
        email = ?, mobile = ?, country = ?, state = ?, district = ?,  
        pincode = ?, address_line_1 = ?, address_line_2 = ?, GSTIN = ?, Region = ?
    `;

    // Include mark_deletion update if disable is set to 1
    const updateValues = [
      entityname, category, contactfirstname, contactlastname, email, mobile, 
      country, state, district,  pincode, address_line_1, address_line_2, GSTIN, Region
    ];
    
    if (disable === 1) {
      updateQuery += `, mark_deletion = ?`;
      updateValues.push(1);
    }
    
    updateQuery += ` WHERE entityid = ?`;
    updateValues.push(entityid);

    // Execute update query
    const [result] = await pool.query(updateQuery, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    res.status(200).json({ message: 'Entity updated successfully' });
  } catch (error) {
    console.error('Error updating entity:', error);
    res.status(500).json({ message: 'Error updating entity', error: error.message });
  }
});

module.exports = router;

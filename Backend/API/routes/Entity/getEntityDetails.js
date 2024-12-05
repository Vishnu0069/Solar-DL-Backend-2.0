// In routes/Entity/getEntityDetails.js
const express = require("express");
const pool = require("../../db");
const router = express.Router();

router.get("/getEntityDetails", async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: "Entity ID is required" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        entityid AS "Entity ID",
        entityname AS "Entity Name",
        category AS "Category",
        contactfirstname AS "Owners First Name",
        contactlastname AS "Owners Last Name",
        email AS "Email Id",
        mobile AS "Mobile",
        country AS "Country",
        region AS "Region",
        state AS "State",
        district AS "District",
        pincode AS "Pincode",
        address_line_1 AS "Address Line1",
        address_line_2 AS "Address Line2",
        GSTIN AS "GSTIN",
        mark_deletion AS "Disable Entity",
        device_count AS "Device Count",
        expiry_date AS "Expiry Date"
      FROM EntityMaster
      WHERE entityid = ?
    `,
      [entityid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Entity not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching entity details:", error);
    res
      .status(500)
      .json({ message: "Error fetching entity details", error: error.message });
  }
});

module.exports = router;

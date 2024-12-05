const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

router.get("/fetchDisabledUsers", async (req, res) => {
  const { entityid } = req.query;

  // Validate input
  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    // Query to fetch all disabled users under the given entityid
    const [rows] = await pool.query(
      `
      SELECT 
        user_id AS "User ID",
        first_name AS "First Name",
        last_name AS "Last Name",
        email AS "Email",
        mobile_number AS "Mobile Number"
      FROM gsai_user
      WHERE entityid = ? AND delete_flag = 1
      `,
      [entityid]
    );

    // Check if there are any matching users
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No disabled users found for the given entityid" });
    }

    // Respond with the formatted data
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching disabled users:", error);
    res.status(500).json({
      message: "Error fetching disabled users",
      error: error.message,
    });
  }
});

module.exports = router;

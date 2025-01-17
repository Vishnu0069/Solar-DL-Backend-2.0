const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();
const auth = require("../../middleware/auth");

router.post("/enableUser", auth, async (req, res) => {
  const { userId } = req.body;

  // Validate input
  if (!userId) {
    return res.status(400).json({ message: "user_id is required" });
  }

  try {
    // Check if the user exists and is currently disabled
    const [checkUser] = await pool.query(
      `
      SELECT * 
      FROM gsai_user 
      WHERE user_id = ? AND delete_flag = 1
      `,
      [userId]
    );

    if (checkUser.length === 0) {
      return res
        .status(404)
        .json({ message: "User not found or is already enabled" });
    }

    // Update the delete_flag to 0
    const [updateResult] = await pool.query(
      `
      UPDATE gsai_user 
      SET delete_flag = 0, last_update_date = NOW() 
      WHERE user_id = ?
      `,
      [userId]
    );

    if (updateResult.affectedRows > 0) {
      return res
        .status(200)
        .json({ message: `User ${userId} enabled successfully` });
    } else {
      return res.status(500).json({ message: "Failed to enable the user" });
    }
  } catch (error) {
    console.error("Error enabling user:", error);
    res.status(500).json({
      message: "Error enabling user",
      error: error.message,
    });
  }
});

module.exports = router;

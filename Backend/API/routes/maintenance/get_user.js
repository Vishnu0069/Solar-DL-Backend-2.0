const express = require("express");
const router = express.Router();
const pool = require("../../db"); // Assuming 'pool' is configured for MySQL connection
//Small test
// Get user details by email
router.get("/user", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM gsai_user WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

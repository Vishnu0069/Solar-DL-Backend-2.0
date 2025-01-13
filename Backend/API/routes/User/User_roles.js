const express = require("express");
const pool = require("../../db"); // Database connection
const router = express.Router();
const auth = require("../../middleware/auth");
// API to fetch user roles for dropdown
router.get("/getUserRoles", auth, async (req, res) => {
  try {
    const [roles] = await pool.query(
      "SELECT role_id, role_name FROM Gsai_UserRoles"
    );

    if (roles.length === 0) {
      return res.status(404).json({ message: "No roles found" });
    }

    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;

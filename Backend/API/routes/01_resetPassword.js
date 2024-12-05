const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
// const pool = require("../../db");
const pool = require("../db");
const router = express.Router();

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password required" });
  }

  try {
    console.log("Starting reset password process...");

    //Checking the token is stored in database
    const [user] = await pool.query(
      "SELECT user_id FROM gsai_user WHERE token=?",
      [token]
    );

    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const user_id = user[0].user_id;

    //hashing the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Update the password in databse
    await pool.query(
      "UPDATE gsai_user SET passwordhashcode = ?,  WHERE user_id=?",
      [hashedPassword, user_id]
    );
    console.log(`Password reset successfully for user ID: ${userId}`);
  } catch (error) {
    console.error("Error during password reset:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
// const pool = require("../../db");
const pool = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password required" });
  }

  try {
    console.log("Starting reset password process...");

    //Checking the token is stored in database
    const [user] = await pool.query(
      "SELECT user_id ,entityid FROM gsai_user WHERE token=?", // todo added email here 2nd update
      [token]
    );

    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const { user_id, entityid } = user[0];
    console.log(`Found user :${user_id} ,Entity:${entityid}`);

    //hashing the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Update the password in databse and update delete_flag to 1
    await pool.query(
      "UPDATE gsai_user SET passwordhashcode = ?  WHERE user_id=?",
      [hashedPassword, user_id]
    );
    console.log(`Password reset  for user ID: ${user_id}`);

    await pool.query("UPDATE gsai_user SET  delete_flag=1 WHERE user_id=?", [
      user_id,
    ]);

    console.log(` delete_flag set to 1 for user ID: ${user_id}`);

    // todo update mark_deletion to 1 after resetting the password

    await pool.query(
      "UPDATE EntityMaster SET mark_deletion =1 WHERE entityid=?",
      [entityid]
    );
    console.log(
      `Mark deletion set to 1 for entities associated with enityId: ${entityid}`
    );

    console.log(`Password reset successfully for user ID: ${user_id}`);

    //Fetch updated rows for verification
    const [updatedUser] = await pool.query(
      "SELECT * FROM gsai_user WHERE user_id = ?",
      [user_id]
    );

    const [updatedEntities] = await pool.query(
      "SELECT * FROM EntityMaster WHERE entityid = ?",
      [entityid]
    );

    res.status(200).json({
      message: "Password reset successfully",
      updatedEntities,
      updatedUser,
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;

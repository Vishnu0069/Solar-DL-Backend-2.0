const express = require("express");
const pool = require("../../db");
const router = express.Router();

router.get("/getUsersByEntity", async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    const [users] = await pool.query(
      `SELECT
          u.user_id AS userId,
          u.first_name AS firstName,
          u.last_name AS lastName,
          u.email AS emailId,
          u.mobile_number AS mobileNo,
          u.user_role AS role,
          u.user_type AS userType,
          e.entityname AS entityName -- Added entityName
       FROM gsai_user u
       INNER JOIN EntityMaster e ON u.entityid = e.entityid
       WHERE u.entityid = ? AND u.delete_flag = 0`, // Excluding deleted users
      [entityid]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found under the specified entity ID" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users by entity:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;

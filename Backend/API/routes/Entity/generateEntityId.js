// In routes/Entity/generateEntityId.js
const express = require("express");
const pool = require("../../db");
const router = express.Router();
const auth = require("../../middleware/auth");

router.post("/generateEntityId", auth, async (req, res) => {
  const { entityid } = req.body;

  if (!entityid) {
    return res.status(400).json({ message: "entityid is required" });
  }

  try {
    // Use the provided `entityid` as the prefix
    const prefix = entityid.toUpperCase().replace(/\s+/g, ""); // Convert to uppercase and remove spaces
    let suffix = 1001;
    let newEntityId;

    while (true) {
      newEntityId = `${prefix}-${suffix}`;

      // Check if this entityid already exists in the database
      const [rows] = await pool.query(
        "SELECT entityid FROM EntityMaster WHERE entityid = ?",
        [newEntityId]
      );

      if (rows.length === 0) {
        // If no existing entityid is found, break out of the loop
        break;
      }

      // Increment suffix if the entityid is already taken
      suffix += 1;
    }

    res.status(200).json({ entityid: newEntityId });
  } catch (error) {
    console.error("Error generating entity ID:", error);
    res
      .status(500)
      .json({ message: "Error generating entity ID", error: error.message });
  }
});

module.exports = router;

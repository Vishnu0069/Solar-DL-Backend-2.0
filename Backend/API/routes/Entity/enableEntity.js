const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();
const auth = require("../../middleware/auth");

router.post("/restoreEntity", auth, async (req, res) => {
  const { entityid } = req.body;

  // Validate the input
  if (!entityid) {
    return res.status(400).json({ message: "entityid is required" });
  }

  try {
    // Check if the entity exists and is marked for deletion
    const [checkEntity] = await pool.query(
      `
      SELECT * 
      FROM EntityMaster 
      WHERE entityid = ? AND mark_deletion = 1
      `,
      [entityid]
    );

    if (checkEntity.length === 0) {
      return res
        .status(404)
        .json({ message: "Entity not found or is not marked for deletion" });
    }

    // Update the mark_deletion flag to 0
    const [updateResult] = await pool.query(
      `
      UPDATE EntityMaster 
      SET mark_deletion = 0, last_update_date = NOW() 
      WHERE entityid = ?
      `,
      [entityid]
    );

    if (updateResult.affectedRows > 0) {
      return res
        .status(200)
        .json({ message: `Entity ${entityid} restored successfully` });
    } else {
      return res.status(500).json({ message: "Failed to restore the entity" });
    }
  } catch (error) {
    console.error("Error restoring entity:", error);
    res
      .status(500)
      .json({ message: "Error restoring entity", error: error.message });
  }
});

module.exports = router;

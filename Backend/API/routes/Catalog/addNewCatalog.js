const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

// Route to insert values into the fetchCatalog table
router.post("/addNewCatalog", async (req, res) => {
  const { catalogId, entityid, make, deviceType, deviceVersion, deviceModel } =
    req.body;

  // Validate input
  if (
    !catalogId ||
    !entityid ||
    !make ||
    !deviceType ||
    !deviceVersion ||
    !deviceModel
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if catalogId already exists
    const [existingCatalog] = await pool.query(
      "SELECT catalogId FROM fetchCatalog WHERE catalogId = ?",
      [catalogId]
    );

    if (existingCatalog.length > 0) {
      return res.status(409).json({
        message: `Catalog with ID ${catalogId} already exists`,
      });
    }

    // Insert the data into the fetchCatalog table
    const query = `
      INSERT INTO fetchCatalog (catalogId, entityid, make, deviceType, deviceVersion, deviceModel, delete_flag) 
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `;
    const [result] = await pool.query(query, [
      catalogId,
      entityid,
      make,
      deviceType,
      deviceVersion,
      deviceModel,
    ]);

    if (result.affectedRows > 0) {
      return res.status(201).json({
        data: {
          catalogId: catalogId,
          make: make,
          deviceType: deviceType,
          deviceVersion: deviceVersion,
          deviceModel: deviceModel,
        },
      });
    } else {
      return res.status(500).json({ message: "Failed to insert catalog" });
    }
  } catch (error) {
    console.error("Error inserting catalog:", error);
    res
      .status(500)
      .json({ message: "Error inserting catalog", error: error.message });
  }
});

module.exports = router;

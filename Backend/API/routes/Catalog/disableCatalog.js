const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

// Route to disable a catalog (set delete_flag to 1)
router.post("/disableCatalog", async (req, res) => {
  const { catalogId } = req.body;

  // Validate the input
  if (!catalogId) {
    return res.status(400).json({ message: "catalogid is required" });
  }

  try {
    // Check if the catalog exists and is not already marked as deleted (delete_flag = 0)
    const [checkCatalog] = await pool.query(
      `
      SELECT * 
      FROM fetchCatalog 
      WHERE catalogId = ? AND delete_flag = 0
      `,
      [catalogId]
    );

    if (checkCatalog.length === 0) {
      return res
        .status(404)
        .json({ message: "Catalog not found or already disabled" });
    }

    // Update the delete_flag to 1 (disable the catalog)
    const [updateResult] = await pool.query(
      `
      UPDATE fetchCatalog 
      SET delete_flag = 1 
      WHERE catalogId = ?
      `,
      [catalogId]
    );

    if (updateResult.affectedRows > 0) {
      return res
        .status(200)
        .json({ message: `Catalog ${catalogId} disabled successfully` });
    } else {
      return res.status(500).json({ message: "Failed to disable the catalog" });
    }
  } catch (error) {
    console.error("Error disabling catalog:", error);
    res
      .status(500)
      .json({ message: "Error disabling catalog", error: error.message });
  }
});

module.exports = router;

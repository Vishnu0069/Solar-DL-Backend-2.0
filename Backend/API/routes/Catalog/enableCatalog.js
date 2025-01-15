const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

// Route to enable a catalog (set delete_flag to 0)
router.post("/enableCatalog", async (req, res) => {
  const { catalogId } = req.body;

  // Validate the input
  if (!catalogId) {
    return res.status(400).json({ message: "catalogid is required" });
  }

  try {
    // Check if the catalog exists and is marked as deleted (delete_flag = 1)
    const [checkCatalog] = await pool.query(
      `
      SELECT * 
      FROM fetchCatalog 
      WHERE catalogId = ? AND delete_flag = 1
      `,
      [catalogId]
    );

    if (checkCatalog.length === 0) {
      return res
        .status(404)
        .json({ message: "Catalog not found or already enabled" });
    }

    // Update the delete_flag to 0 (enable the catalog)
    const [updateResult] = await pool.query(
      `
      UPDATE fetchCatalog 
      SET delete_flag = 0 
      WHERE catalogId = ?
      `,
      [catalogId]
    );

    if (updateResult.affectedRows > 0) {
      return res
        .status(200)
        .json({ message: `Catalog ${catalogId} enabled successfully` });
    } else {
      return res.status(500).json({ message: "Failed to enable the catalog" });
    }
  } catch (error) {
    console.error("Error enabling catalog:", error);
    res
      .status(500)
      .json({ message: "Error enabling catalog", error: error.message });
  }
});

module.exports = router;

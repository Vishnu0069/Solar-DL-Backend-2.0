const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

router.post("/deviceData", async (req, res) => {
  const { catalogId, deviceVersion, deviceModel } = req.body;

  if (!catalogId || !deviceVersion || !deviceModel) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const query =
      "UPDATE fetchCatalog SET deviceVersion=? , deviceModel=? WHERE catalogId=?";
    const [results] = await pool.query(query, [
      deviceVersion,
      deviceModel,
      catalogId,
    ]);

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: "Catalog ID not found in fetchCatalog for update",
      });
    }

    res.json({ deviceVersion, deviceModel });
  } catch (error) {
    return res.status(500).json({
      message: "Error while updating the fields",
      error: error.message,
    });
  }
});

module.exports = router;

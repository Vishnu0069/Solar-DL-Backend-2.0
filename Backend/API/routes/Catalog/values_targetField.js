const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();
// Fetch fields for a specific header
router.get("/fetchFields", async (req, res) => {
  const { header } = req.body;

  try {
    const [fields] = await pool.query(
      "SELECT fields FROM gsai_targetfields WHERE header = ?",
      [header]
    );

    if (fields.length === 0) {
      return res
        .status(404)
        .json({ message: "No fields found for the given header" });
    }

    // Split the fields into an array for frontend ease
    const fieldList = fields[0].fields.split(",");
    res.status(200).json({ header, fields: fieldList });
  } catch (error) {
    console.error("Error fetching fields:", error);
    res
      .status(500)
      .json({ message: "Error fetching fields", error: error.message });
  }
});

module.exports = router;

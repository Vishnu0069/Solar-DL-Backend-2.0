const express = require("express");
const router = express.Router();
const connection = require("../../db/index");
const auth = require("../../middleware/auth");

router.post("/getlanguages/:entity_id", auth, async (req, res) => {
  const { entity_id } = req.params;

  try {
    // Query to fetch languages for the given entity_id
    const query = `
      SELECT languages
      FROM gsai_entity_settings
      WHERE entity_id = ?
    `;

    const [rows] = await connection.query(query, [entity_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error_message: `No record found for entity_id: ${entity_id}`,
      });
    }

    res.status(200).json({
      languages: rows[0].languages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error_message: "An error occurred while fetching languages.",
    });
  }
});

module.exports = router;

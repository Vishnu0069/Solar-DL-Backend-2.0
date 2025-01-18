const express = require("express");
const router = express.Router();
const connection = require("../../db/index");
const auth = require("../../middleware/auth");

router.post("/getlocations/:entity_id", auth, async (req, res) => {
  const { entity_id } = req.params;

  try {
    // Query to fetch country_locations for the given entity_id
    const query = `
      SELECT country_locations
      FROM gsai_entity_settings
      WHERE entity_id = ?
    `;

    const [rows] = await connection.query(query, [entity_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error_message: `No record found for entity_id: ${entity_id}`,
      });
    }

    // Parse JSON from the database before sending the response
    const country_locations = JSON.parse(rows[0].country_locations);

    res.status(200).json({
      country_locations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error_message: "An error occurred while fetching country locations.",
    });
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const connection = require("../../db/index");
// const auth = require("../../middleware/auth");

// router.post("/updatelocations", auth, async (req, res) => {
//   const { entity_id, country_locations } = req.body;

//   // Validate request body
//   if (!entity_id || !country_locations) {
//     return res.status(400).json({
//       error_message: "Please provide entity_id and country_locations.",
//     });
//   }

//   try {
//     // Convert country_locations to JSON string
//     const countryLocationsJson = JSON.stringify(country_locations);

//     // Insert or update the country_locations field for the given entity_id
//     const query = `
//       INSERT INTO gsai_entity_settings (entity_id, country_locations)
//       VALUES (?, ?)
//       ON DUPLICATE KEY UPDATE
//         country_locations = VALUES(country_locations)
//     `;

//     await connection.query(query, [entity_id, countryLocationsJson]);

//     res.status(200).json({
//       message: "Country locations saved successfully.",
//       entity_id,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error_message: "An error occurred while saving country locations.",
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const connection = require("../../db/index");
const auth = require("../../middleware/auth");

router.post("/savelocation", auth, async (req, res) => {
  const { entityId, country_locations } = req.body;

  // Validate request body
  if (!entityId || !country_locations) {
    return res.status(400).json({
      error_message: "Please provide entity_id and country_locations.",
    });
  }

  try {
    // Convert country_locations to JSON string
    const countryLocationsJson = JSON.stringify(country_locations);

    // Insert or update the country_locations field for the given entity_id
    const query = `
      INSERT INTO gsai_entity_settings (entity_id, country_locations)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        country_locations = VALUES(country_locations)
    `;

    await connection.query(query, [entityId, countryLocationsJson]);

    res.status(200).json({
      message: "Country locations updated successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error_message:
        "An error occurred while updating or inserting country locations.",
    });
  }
});

module.exports = router;

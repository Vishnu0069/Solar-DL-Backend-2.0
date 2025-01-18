// const express = require("express");
// const router = express.Router();
// const connection = require("../../db/index");
// const auth = require("../../middleware/auth");

// router.post("/updatelanguages", auth, async (req, res) => {
//   const { entity_id, languages } = req.body;

//   // Validate request body
//   if (!entity_id || !languages) {
//     return res.status(400).json({
//       error_message: "Please provide entity_id and languages.",
//     });
//   }

//   try {
//     // Insert or update the languages field for the given entity_id
//     const query = `
//       INSERT INTO gsai_entity_settings (entity_id, languages)
//       VALUES (?, ?)
//       ON DUPLICATE KEY UPDATE
//         languages = VALUES(languages)
//     `;

//     await connection.query(query, [entity_id, languages]);

//     res.status(200).json({
//       message: "Languages saved successfully.",
//       entity_id,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error_message: "An error occurred while saving languages.",
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const connection = require("../../db/index");
const auth = require("../../middleware/auth");

router.post("/savelanguages", auth, async (req, res) => {
  const { entity_id, languages } = req.body;

  // Validate request body
  if (!entity_id || !languages) {
    return res.status(400).json({
      error_message: "Please provide entity_id and languages.",
    });
  }

  try {
    // Insert a new record or update the languages field if the entity_id already exists
    const query = `
      INSERT INTO gsai_entity_settings (entity_id, languages)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        languages = VALUES(languages)
    `;

    await connection.query(query, [entity_id, languages]);

    res.status(200).json({
      message: "Languages saved successfully.",
      entity_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error_message: "An error occurred while saving languages.",
    });
  }
});

module.exports = router;

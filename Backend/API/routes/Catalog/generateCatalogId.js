// const express = require("express");
// const pool = require("../../db");
// const router = express.Router();

// router.post("/generateCatalogId", async (req, res) => {
//   const { entityid } = req.body;

//   if (!entityid) {
//     return res.status(400).json({ message: "entityid is required" });
//   }

//   try {
//     // Remove any suffix after the last dash in entityid
//     const prefix = entityid.split("-")[0];
//     let suffix = 1001; // Starting value for suffix
//     let newCatalogId;

//     while (true) {
//       newCatalogId = `${prefix}-C-${suffix}`;

//       // Check if this catalog_id already exists in the database
//       const [rows] = await pool.query(
//         "SELECT catalogid FROM fetchCatalog WHERE catalogid = ?",
//         [newCatalogId]
//       );

//       if (rows.length === 0) break;

//       suffix += 1; // Increment the suffix if the catalog ID already exists
//     }

//     res.status(200).json({ catalogId: newCatalogId });
//   } catch (error) {
//     console.error("Error generating catalog ID:", error);
//     res
//       .status(500)
//       .json({ message: "Error generating catalog ID", error: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const pool = require("../../db");
const router = express.Router();

router.post("/generateCatalogId", async (req, res) => {
  const { entityid } = req.body;

  if (!entityid) {
    return res.status(400).json({ message: "entityid is required" });
  }

  try {
    // Extract prefix from entityid (before the hyphen)
    const prefix = entityid.split("-")[0];
    let suffix = 1001; // Starting suffix for the catalog ID
    let newCatalogId;

    while (true) {
      newCatalogId = `${prefix}-C-${suffix}`;

      // Check if this catalog_id already exists in the database
      const [rows] = await pool.query(
        "SELECT catalogid FROM fetchCatalog WHERE catalogid = ?",
        [newCatalogId]
      );

      if (rows.length === 0) {
        // If no existing catalog found, break the loop and use the generated catalogId
        break;
      }

      suffix += 1; // Increment suffix if catalogId already exists
    }

    // Return the generated catalogId
    res.status(200).json({ catalog_id: newCatalogId });
  } catch (error) {
    console.error("Error generating catalog ID:", error);
    res
      .status(500)
      .json({ message: "Error generating catalog ID", error: error.message });
  }
});

module.exports = router;

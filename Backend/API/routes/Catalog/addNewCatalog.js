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

// const express = require("express");
// const router = express.Router();
// const pool = require("../../db"); // Ensure this points to your database connection file

// // Route to insert new catalog and save targetFields and sourceFields into fetchCatalog
// router.post("/addNewCatalog", async (req, res) => {
//   const {
//     catalogId,
//     entityId,
//     transid,
//     make,
//     deviceType,
//     deviceVersion,
//     deviceModel,
//   } = req.body;

//   // Validate input
//   if (
//     !catalogId ||
//     !entityId ||
//     !transid ||
//     !make ||
//     !deviceType ||
//     !deviceVersion ||
//     !deviceModel
//   ) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     // Fetch targetFields from gsai_targetfields table
//     const [targetFieldsResult] = await pool.query(
//       "SELECT fields FROM gsai_targetfields WHERE transid = ?",
//       [transid]
//     );

//     // Fetch sourceFields from gsai_sourcefields table
//     const [sourceFieldsResult] = await pool.query(
//       "SELECT fields FROM gsai_sourcefields WHERE transid = ?",
//       [transid]
//     );

//     // Check if data is found
//     if (targetFieldsResult.length === 0 || sourceFieldsResult.length === 0) {
//       return res
//         .status(404)
//         .json({
//           message:
//             "No targetFields or sourceFields found for the given transid",
//         });
//     }

//     // Get the targetFields and sourceFields values
//     const targetFields = targetFieldsResult[0].fields;
//     const sourceFields = sourceFieldsResult[0].fields;

//     // Insert the catalog along with targetFields and sourceFields into fetchCatalog table
//     const query = `
//       INSERT INTO fetchCatalog (catalogId, entityId, make, deviceType, deviceVersion, deviceModel, targetFields, sourceFields, delete_flag)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
//     `;

//     const [result] = await pool.query(query, [
//       catalogId,
//       entityId,
//       make,
//       deviceType,
//       deviceVersion,
//       deviceModel,
//       targetFields,
//       sourceFields,
//     ]);

//     if (result.affectedRows > 0) {
//       return res.status(201).json({
//         message: `Catalog with ID ${catalogId} added successfully with targetFields and sourceFields`,
//         data: {
//           catalogId: catalogId,
//           entityId: entityId,
//           make: make,
//           deviceType: deviceType,
//           deviceVersion: deviceVersion,
//           deviceModel: deviceModel,
//           targetFields: targetFields,
//           sourceFields: sourceFields,
//         },
//       });
//     } else {
//       return res
//         .status(500)
//         .json({ message: "Failed to insert catalog into fetchCatalog" });
//     }
//   } catch (error) {
//     console.error("Error inserting catalog into fetchCatalog:", error);
//     res
//       .status(500)
//       .json({ message: "Error inserting catalog", error: error.message });
//   }
// });

// module.exports = router;

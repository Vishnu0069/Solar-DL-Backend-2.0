// const express = require("express");
// const pool = require("../../db"); // Ensure this points to your database connection file
// const router = express.Router();

// // Route to add or update fields to fetchCatalog and gsai_sourcefields tables
// router.post("/addTargetSource", async (req, res) => {
//   const { catalogId, targetHeader, targetfields, sourceHeader, sourceFields } =
//     req.body;

//   // Validate input
//   if (!catalogId || !targetHeader || !targetfields || !sourceFields) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     // Step 1: Fetch the transid from gsai_targetfields based on targetHeader
//     const [targetFieldResult] = await pool.query(
//       "SELECT transid FROM gsai_targetfields WHERE header = ?",
//       [targetHeader]
//     );

//     // Check if transid exists for the given targetHeader
//     if (targetFieldResult.length === 0) {
//       return res.status(404).json({ message: "Target header not found" });
//     }

//     const transid = targetFieldResult[0].transid;

//     // Step 2: Check if catalogId exists in fetchCatalog
//     const [catalogResult] = await pool.query(
//       "SELECT * FROM fetchCatalog WHERE catalogId = ?",
//       [catalogId]
//     );

//     // If catalogId does not exist, return an error
//     if (catalogResult.length === 0) {
//       return res.status(404).json({ message: "Catalog ID not found" });
//     }

//     // Step 3: Update the fetchCatalog table with new targetFields and sourceFields based on catalogId
//     const updateCatalogQuery = `
//       UPDATE fetchCatalog
//       SET targetFields = ?, sourceFields = ?
//       WHERE catalogId = ?
//     `;
//     const [updateCatalogResult] = await pool.query(updateCatalogQuery, [
//       targetfields,
//       sourceFields,
//       catalogId,
//     ]);

//     // Step 4: Insert sourceHeader and sourceFields into gsai_sourcefields table
//     const insertSourceFieldsQuery = `
//       INSERT INTO gsai_sourceFields (catalogId, header, fields, transid)
//       VALUES (?, ?, ?, ?)
//     `;
//     const [insertSourceFieldsResult] = await pool.query(
//       insertSourceFieldsQuery,
//       [catalogId, sourceHeader, sourceFields, transid]
//     );

//     // If insertion into gsai_sourcefields is successful
//     if (insertSourceFieldsResult.affectedRows > 0) {
//       return res.status(200).json({
//         message: "Fields updated successfully",
//         data: {
//           catalogId: catalogId,
//           targetFields: targetfields,
//           sourceFields: sourceFields,
//         },
//       });
//     } else {
//       return res
//         .status(500)
//         .json({ message: "Failed to insert source fields" });
//     }
//   } catch (error) {
//     console.error("Error adding fields:", error);
//     res
//       .status(500)
//       .json({ message: "Error adding fields", error: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

router.post("/addTargetSource", async (req, res) => {
  const { catalogId, targetHeader, targetfields, sourceHeader, sourceFields } =
    req.body;

  if (!catalogId || !targetHeader || !targetfields || !sourceFields) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Step 1: Fetch the transid for the targetHeader
    const [targetFieldResult] = await pool.query(
      "SELECT transid FROM gsai_targetfields WHERE header = ?",
      [targetHeader]
    );

    if (targetFieldResult.length === 0) {
      return res.status(404).json({ message: "Target header not found" });
    }

    const transid = targetFieldResult[0].transid;
    console.log(`TransID : ${transid}`);

    // Step 2: Always update the fetchCatalog table
    const updateCatalogQuery = `
      UPDATE fetchCatalog 
      SET targetFields = ?, sourceFields = ? 
      WHERE catalogId = ?
    `;
    const [updateCatalogResult] = await pool.query(updateCatalogQuery, [
      targetfields,
      sourceFields,
      catalogId,
    ]);

    // Check if catalogId exists in fetchCatalog
    if (updateCatalogResult.affectedRows === 0) {
      return res.status(404).json({
        message: "Catalog ID not found in fetchCatalog for update",
      });
    }

    // Step 3: Check if the record exists in gsai_sourcefields
    const [sourceFieldExists] = await pool.query(
      "SELECT * FROM gsai_sourceFields WHERE catalogId = ?",
      [catalogId]
    );

    if (sourceFieldExists.length > 0) {
      // Record exists, update it
      const updateSourceFieldsQuery = `
        UPDATE gsai_sourceFields 
        SET header = ?, fields = ?, transid = ? 
        WHERE catalogId = ?
      `;
      await pool.query(updateSourceFieldsQuery, [
        sourceHeader,
        sourceFields,
        transid,
        catalogId,
      ]);
    } else {
      // Record does not exist, insert it
      const insertSourceFieldsQuery = `
        INSERT INTO gsai_sourcefields (catalogId, header, fields, transid) 
        VALUES (?, ?, ?, ?)
      `;
      await pool.query(insertSourceFieldsQuery, [
        catalogId,
        sourceHeader,
        sourceFields,
        transid,
      ]);
    }

    return res.status(200).json({
      message: "Fields updated successfully",
      data: {
        catalogId,
        targetFields: targetfields,
        sourceFields,
      },
    });
  } catch (error) {
    console.error("Error adding or updating fields:", error);
    res.status(500).json({
      message: "Error adding or updating fields",
      error: error.message,
    });
  }
});

module.exports = router;

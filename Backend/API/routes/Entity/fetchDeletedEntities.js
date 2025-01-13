// const express = require("express");
// const pool = require("../../db"); // Ensure this points to your database connection file
// const router = express.Router();

// router.get("/fetchDeletedEntities", async (req, res) => {
//   const { entityid } = req.query;

//   // Validate the input
//   if (!entityid) {
//     return res.status(400).json({ message: "entityid parameter is required" });
//   }

//   try {
//     // Query to fetch records where masterentityid matches and mark_deletion is set to 1
//     const [rows] = await pool.query(
//       `
//       SELECT *
//       FROM EntityMaster
//       WHERE masterentityid = ? AND mark_deletion = 1
//       `,
//       [entityid]
//     );

//     // Check if there are any matching records
//     if (rows.length === 0) {
//       return res.status(404).json({
//         message:
//           "No records found for the given entityid with mark_deletion set to 1",
//       });
//     }

//     // Transform the result into the required format
//     const transformedData = rows.map((row) => ({
//       id: row.entityid,
//       "Entity Name": row.entityname,
//       "First Name": row.contactfirstname,
//       "Last Name": row.contactlastname,
//       "Email Id": row.email,
//       "Mobile Number": row.mobile,
//       Namespace: row.namespace,
//       Country: row.country,
//       State: row.state,
//       District: row.district,
//       Pincode: row.pincode,
//       GSTIN: row.GSTIN,
//       Category: row.category,
//       Region: row.region,
//     }));

//     // Respond with the transformed data
//     res.status(200).json(transformedData);
//   } catch (error) {
//     console.error("Error fetching deleted entities:", error);
//     res.status(500).json({
//       message: "Error fetching deleted entities",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;

//Via namespace 08/01/25
const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();
const auth = require("../../middleware/auth");

router.get("/fetchDeletedEntities", auth, async (req, res) => {
  const { entityid } = req.query;

  // Validate the input
  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    // Fetch the namespace for the given entityid
    const [entityData] = await pool.query(
      "SELECT namespace FROM EntityMaster WHERE entityid = ?",
      [entityid]
    );

    if (entityData.length === 0) {
      return res.status(404).json({ message: "Entity not found" });
    }

    const namespace = entityData[0].namespace;
    const namespaceParts = namespace.split("-");

    let query;
    let params;

    if (namespaceParts.length === 1) {
      // L0: Fetch deleted entities for all entities under the namespace L1 and L2
      query = `
        SELECT 
          e.entityid AS "id",
          e.entityname AS "Entity Name",
          e.contactfirstname AS "First Name",
          e.contactlastname AS "Last Name",
          e.email AS "Email Id",
          e.mobile AS "Mobile Number",
          e.namespace AS "Namespace",
          e.country AS "Country",
          e.state AS "State",
          e.district AS "District",
          e.pincode AS "Pincode",
          e.GSTIN AS "GSTIN",
          e.category AS "Category",
          e.region AS "Region"
        FROM EntityMaster e
        WHERE e.namespace LIKE CONCAT(?, '%') AND e.mark_deletion = 1
      `;
      params = [namespace];
    } else if (namespaceParts.length === 2) {
      // L1: Fetch deleted entities for all entities under the namespace L2
      query = `
        SELECT 
          e.entityid AS "id",
          e.entityname AS "Entity Name",
          e.contactfirstname AS "First Name",
          e.contactlastname AS "Last Name",
          e.email AS "Email Id",
          e.mobile AS "Mobile Number",
          e.namespace AS "Namespace",
          e.country AS "Country",
          e.state AS "State",
          e.district AS "District",
          e.pincode AS "Pincode",
          e.GSTIN AS "GSTIN",
          e.category AS "Category",
          e.region AS "Region"
        FROM EntityMaster e
        WHERE e.namespace LIKE CONCAT(?, '-%') AND e.mark_deletion = 1
      `;
      params = [namespace];
    } else {
      // L2: Fetch only the deleted entities for the specific entity
      query = `
        SELECT 
          e.entityid AS "id",
          e.entityname AS "Entity Name",
          e.contactfirstname AS "First Name",
          e.contactlastname AS "Last Name",
          e.email AS "Email Id",
          e.mobile AS "Mobile Number",
          e.namespace AS "Namespace",
          e.country AS "Country",
          e.state AS "State",
          e.district AS "District",
          e.pincode AS "Pincode",
          e.GSTIN AS "GSTIN",
          e.category AS "Category",
          e.region AS "Region"
        FROM EntityMaster e
        WHERE e.namespace = ? AND e.mark_deletion = 1
      `;
      params = [namespace];
    }

    // Execute the query
    const [rows] = await pool.query(query, params);

    // Check if there are any matching records
    if (rows.length === 0) {
      return res.status(404).json({
        message:
          "No records found for the given entityid with mark_deletion set to 1",
      });
    }

    // Respond with the transformed data
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching deleted entities:", error);
    res.status(500).json({
      message: "Error fetching deleted entities",
      error: error.message,
    });
  }
});

module.exports = router;

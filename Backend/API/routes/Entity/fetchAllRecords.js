// // In routes/Entity/fetchAllRecords.js
// const express = require('express');
// const pool = require('../../db');
// const router = express.Router();

// router.get('/fetchAllRecords', async (req, res) => {
//   const { entityid } = req.query;

//   if (!entityid) {
//     return res.status(400).json({ message: 'entityid parameter is required' });
//   }

//   try {
//     // Step 1: Check if the given entity has masterentityid set to '1111'
//     const [masterCheck] = await pool.query(`
//       SELECT masterentityid
//       FROM EntityMaster
//       WHERE entityid = ?
//     `, [entityid]);

//     if (masterCheck.length === 0) {
//       return res.status(404).json({ message: 'Entity not found' });
//     }

//     const masterEntityId = masterCheck[0].masterentityid;

//     let query;
//     let params;

//     // Step 2: Determine the query based on masterEntityId
//     if (masterEntityId === '1111') {
//       // If masterentityid is '1111', get all records that start with entityid prefix
//       query = `
//         SELECT
//           entityid AS id,
//           entityname AS "Entity Name",
//           contactfirstname AS "First Name",
//           contactlastname AS "Last Name",
//           email AS "Email Id",
//           mobile AS "Mobile Number",
//           namespace AS "Namespace",
//           country AS "Country",
//           state AS "State",
//           district AS "District",
//           pincode AS "Pincode",
//           GSTIN AS "GSTIN",
//           category AS "Category",
//           region AS "Region"
//         FROM EntityMaster
//         WHERE entityid LIKE CONCAT(?, '%') AND mark_deletion = 0
//       `;
//       params = [entityid];
//     } else {
//       // If masterentityid is not '1111', only get the specified record
//       query = `
//         SELECT
//           entityid AS id,
//           entityname AS "Entity Name",
//           contactfirstname AS "First Name",
//           contactlastname AS "Last Name",
//           email AS "Email Id",
//           mobile AS "Mobile Number",
//           namespace AS "Namespace",
//           country AS "Country",
//           state AS "State",
//           district AS "District",
//           pincode AS "Pincode",
//           GSTIN AS "GSTIN",
//           category AS "Category",
//           region AS "Region"
//         FROM EntityMaster
//         WHERE entityid = ? AND mark_deletion = 0
//       `;
//       params = [entityid];
//     }

//     const [rows] = await pool.query(query, params);
//     res.status(200).json(rows);

//   } catch (error) {
//     console.error('Error fetching records:', error);
//     res.status(500).json({ message: 'Error fetching records', error: error.message });
//   }
// });

// module.exports = router;

// // In routes/Entity/fetchAllRecords.js
// const express = require("express");
// const pool = require("../../db");
// const router = express.Router();

// router.get("/fetchAllRecords", async (req, res) => {
//   const { entityid } = req.query;

//   if (!entityid) {
//     return res.status(400).json({ message: "entityid parameter is required" });
//   }

//   try {
//     // Step 1: Check if the given entity has a masterentityid set to '1111'
//     const [masterCheck] = await pool.query(
//       `
//       SELECT masterentityid
//       FROM EntityMaster
//       WHERE entityid = ?
//       `,
//       [entityid]
//     );

//     if (masterCheck.length === 0) {
//       return res.status(404).json({ message: "Entity not found" });
//     }

//     const masterEntityId = masterCheck[0].masterentityid;

//     let query;
//     let params;

//     // Step 2: Determine the query based on masterEntityId
//     if (masterEntityId === "1111") {
//       // Fetch all entities where masterentityid matches the given entityid
//       // Include the current entity details
//       query = `
//         SELECT
//           entityid AS id,
//           entityname AS "Entity Name",
//           contactfirstname AS "First Name",
//           contactlastname AS "Last Name",
//           email AS "Email Id",
//           mobile AS "Mobile Number",
//           namespace AS "Namespace",
//           country AS "Country",
//           state AS "State",
//           district AS "District",
//           pincode AS "Pincode",
//           GSTIN AS "GSTIN",
//           category AS "Category",
//           region AS "Region"
//         FROM EntityMaster
//         WHERE (masterentityid = ? OR entityid = ?) AND mark_deletion = 0
//       `;
//       params = [entityid, entityid];
//     } else {
//       // Fetch only the specified record
//       query = `
//         SELECT
//           entityid AS id,
//           entityname AS "Entity Name",
//           contactfirstname AS "First Name",
//           contactlastname AS "Last Name",
//           email AS "Email Id",
//           mobile AS "Mobile Number",
//           namespace AS "Namespace",
//           country AS "Country",
//           state AS "State",
//           district AS "District",
//           pincode AS "Pincode",
//           GSTIN AS "GSTIN",
//           category AS "Category",
//           region AS "Region"
//         FROM EntityMaster
//         WHERE entityid = ? AND mark_deletion = 0
//       `;
//       params = [entityid];
//     }

//     const [rows] = await pool.query(query, params);
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("Error fetching records:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching records", error: error.message });
//   }
// });

// module.exports = router;

// //11/27/2024
// const express = require("express");
// const pool = require("../../db");
// const router = express.Router();

// router.get("/fetchAllRecords", async (req, res) => {
//   const { entityid } = req.query;

//   if (!entityid) {
//     return res.status(400).json({ message: "entityid parameter is required" });
//   }

//   try {
//     // Step 1: Check if the given entity exists and fetch its masterentityid
//     const [masterCheck] = await pool.query(
//       `
//       SELECT masterentityid
//       FROM EntityMaster
//       WHERE entityid = ?
//       `,
//       [entityid]
//     );

//     if (masterCheck.length === 0) {
//       return res.status(404).json({ message: "Entity not found" });
//     }

//     const masterEntityId = masterCheck[0].masterentityid;

//     let query;
//     let params;

//     // Step 2: Determine query based on the masterentityid
//     if (masterEntityId === "1111") {
//       // Fetch all entities where masterentityid matches the given entityid, including the current entity
//       query = `
//         SELECT
//           entityid AS id,
//           entityname AS "Entity Name",
//           contactfirstname AS "First Name",
//           contactlastname AS "Last Name",
//           email AS "Email Id",
//           mobile AS "Mobile Number",
//           namespace AS "Namespace",
//           country AS "Country",
//           state AS "State",
//           district AS "District",
//           pincode AS "Pincode",
//           GSTIN AS "GSTIN",
//           category AS "Category",
//           region AS "Region",
//           device_count AS "Device Count",
//           expiry_date AS "Expiry Date"
//         FROM EntityMaster
//         WHERE (masterentityid = ? OR entityid = ?) AND mark_deletion = 0
//       `;
//       params = [entityid, entityid];
//     } else {
//       // Check if the given entityid is a masterentityid for other entities
//       const [linkedEntities] = await pool.query(
//         `
//         SELECT
//           entityid AS id,
//           entityname AS "Entity Name",
//           contactfirstname AS "First Name",
//           contactlastname AS "Last Name",
//           email AS "Email Id",
//           mobile AS "Mobile Number",
//           namespace AS "Namespace",
//           country AS "Country",
//           state AS "State",
//           district AS "District",
//           pincode AS "Pincode",
//           GSTIN AS "GSTIN",
//           category AS "Category",
//           region AS "Region",
//           device_count AS "Device Count",
//           expiry_date AS "Expiry Date"
//         FROM EntityMaster
//         WHERE masterentityid = ? AND mark_deletion = 0
//         `,
//         [entityid]
//       );

//       if (linkedEntities.length > 0) {
//         // If the given entityid is a masterentityid, fetch its linked entities and include itself
//         query = `
//           SELECT
//             entityid AS id,
//             entityname AS "Entity Name",
//             contactfirstname AS "First Name",
//             contactlastname AS "Last Name",
//             email AS "Email Id",
//             mobile AS "Mobile Number",
//             namespace AS "Namespace",
//             country AS "Country",
//             state AS "State",
//             district AS "District",
//             pincode AS "Pincode",
//             GSTIN AS "GSTIN",
//             category AS "Category",
//             region AS "Region",
//             device_count AS "Device Count",
//             expiry_date AS "Expiry Date"
//           FROM EntityMaster

//           WHERE masterentityid = ? OR entityid = ?
//         `;
//         params = [entityid, entityid];
//       } else {
//         // If the given entityid is not a masterentityid, return only its details
//         query = `
//           SELECT
//             entityid AS id,
//             entityname AS "Entity Name",
//             contactfirstname AS "First Name",
//             contactlastname AS "Last Name",
//             email AS "Email Id",
//             mobile AS "Mobile Number",
//             namespace AS "Namespace",
//             country AS "Country",
//             state AS "State",
//             district AS "District",
//             pincode AS "Pincode",
//             GSTIN AS "GSTIN",
//             category AS "Category",
//             region AS "Region",
//             device_count AS "Device Count",
//             expiry_date AS "Expiry Date"
//           FROM EntityMaster
//           WHERE entityid = ?
//         `;
//         params = [entityid];
//       }
//     }

//     // Execute the query
//     const [rows] = await pool.query(query, params);
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("Error fetching records:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching records", error: error.message });
//   }
// });

// module.exports = router;

//Updated to get the login user to be on top - Vp

// const express = require("express");
// const pool = require("../../db");
// const router = express.Router();

// router.get("/fetchAllRecords", async (req, res) => {
//   const { entityid } = req.query;

//   if (!entityid) {
//     return res.status(400).json({ message: "entityid parameter is required" });
//   }

//   try {
//     // Step 1: Check if the given entity exists and fetch its masterentityid
//     const [masterCheck] = await pool.query(
//       `
//       SELECT masterentityid
//       FROM EntityMaster
//       WHERE entityid = ?
//       `,
//       [entityid]
//     );

//     if (masterCheck.length === 0) {
//       return res.status(404).json({ message: "Entity not found" });
//     }

//     const masterEntityId = masterCheck[0].masterentityid;

//     let query;
//     let params;

//     // Step 2: Determine query based on the masterentityid
//     if (masterEntityId === "1111") {
//       // Fetch all entities where masterentityid matches the given entityid, including the current entity
//       query = `
//         SELECT
//           entityid AS id,
//           entityname AS "Entity Name",
//           contactfirstname AS "First Name",
//           contactlastname AS "Last Name",
//           email AS "Email Id",
//           mobile AS "Mobile Number",
//           namespace AS "Namespace",
//           country AS "Country",
//           state AS "State",
//           district AS "District",
//           pincode AS "Pincode",
//           GSTIN AS "GSTIN",
//           category AS "Category",
//           region AS "Region",
//           device_count AS "Device Count",
//           expiry_date AS "Expiry Date"
//         FROM EntityMaster
//         WHERE (masterentityid = ? OR entityid = ?) AND mark_deletion = 0
//         ORDER BY CASE WHEN entityid = ? THEN 0 ELSE 1 END, entityname
//       `;
//       params = [entityid, entityid, entityid];
//     } else {
//       // Check if the given entityid is a masterentityid for other entities
//       const [linkedEntities] = await pool.query(
//         `
//         SELECT
//           entityid AS id,
//           entityname AS "Entity Name",
//           contactfirstname AS "First Name",
//           contactlastname AS "Last Name",
//           email AS "Email Id",
//           mobile AS "Mobile Number",
//           namespace AS "Namespace",
//           country AS "Country",
//           state AS "State",
//           district AS "District",
//           pincode AS "Pincode",
//           GSTIN AS "GSTIN",
//           category AS "Category",
//           region AS "Region",
//           device_count AS "Device Count",
//           expiry_date AS "Expiry Date"
//         FROM EntityMaster
//         WHERE masterentityid = ? AND mark_deletion = 0
//         `,
//         [entityid]
//       );

//       if (linkedEntities.length > 0) {
//         // If the given entityid is a masterentityid, fetch its linked entities and include itself
//         query = `
//           SELECT
//             entityid AS id,
//             entityname AS "Entity Name",
//             contactfirstname AS "First Name",
//             contactlastname AS "Last Name",
//             email AS "Email Id",
//             mobile AS "Mobile Number",
//             namespace AS "Namespace",
//             country AS "Country",
//             state AS "State",
//             district AS "District",
//             pincode AS "Pincode",
//             GSTIN AS "GSTIN",
//             category AS "Category",
//             region AS "Region",
//             device_count AS "Device Count",
//             expiry_date AS "Expiry Date"
//           FROM EntityMaster
//           WHERE masterentityid = ? OR entityid = ?
//           ORDER BY CASE WHEN entityid = ? THEN 0 ELSE 1 END, entityname
//         `;
//         params = [entityid, entityid, entityid];
//       } else {
//         // If the given entityid is not a masterentityid, return only its details
//         query = `
//           SELECT
//             entityid AS id,
//             entityname AS "Entity Name",
//             contactfirstname AS "First Name",
//             contactlastname AS "Last Name",
//             email AS "Email Id",
//             mobile AS "Mobile Number",
//             namespace AS "Namespace",
//             country AS "Country",
//             state AS "State",
//             district AS "District",
//             pincode AS "Pincode",
//             GSTIN AS "GSTIN",
//             category AS "Category",
//             region AS "Region",
//             device_count AS "Device Count",
//             expiry_date AS "Expiry Date"
//           FROM EntityMaster
//           WHERE entityid = ?
//         `;
//         params = [entityid];
//       }
//     }

//     // Execute the query
//     const [rows] = await pool.query(query, params);
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("Error fetching records:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching records", error: error.message });
//   }
// });

// module.exports = router;

//Updated to get via namespace -Vp
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const pool = require("../../db");
require("dotenv").config();

router.get("/fetchAllRecords", async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    // Step 1: Fetch the namespace of the entity
    const [entityData] = await pool.query(
      `SELECT namespace, entityid, entityname, contactfirstname, contactlastname, email, mobile, country, state, district, pincode, GSTIN, category, region, device_count, expiry_date, mark_deletion
       FROM EntityMaster WHERE entityid = ?`,
      [entityid]
    );

    if (entityData.length === 0) {
      return res.status(404).json({ message: "Entity not found" });
    }

    const currentEntity = entityData[0];

    if (currentEntity.mark_deletion !== 0) {
      return res.status(400).json({ message: "Entity is marked as deleted." });
    }

    const namespace = currentEntity.namespace;
    const namespaceParts = namespace.split("-");

    let query;
    let params;

    if (namespaceParts.length === 1) {
      // L0: Fetch all entities with a namespace starting with GREENSAGEAI- (next levels)
      query = `
        SELECT 
          entityid AS id,
          entityname AS "Entity Name",
          contactfirstname AS "First Name",
          contactlastname AS "Last Name",
          email AS "Email Id",
          mobile AS "Mobile Number",
          namespace AS "Namespace",
          country AS "Country",
          state AS "State",
          district AS "District",
          pincode AS "Pincode",
          GSTIN AS "GSTIN",
          category AS "Category",
          region AS "Region",
          device_count AS "Device Count",
          expiry_date AS "Expiry Date"
        FROM EntityMaster
        WHERE namespace LIKE CONCAT(?, '-%') AND mark_deletion = 0
        ORDER BY namespace, entityname
      `;
      params = [namespace];
    } else if (namespaceParts.length === 2) {
      // L1: Fetch all entities with a namespace starting with GREENSAGEAI-SomeEntity-
      query = `
        SELECT 
          entityid AS id,
          entityname AS "Entity Name",
          contactfirstname AS "First Name",
          contactlastname AS "Last Name",
          email AS "Email Id",
          mobile AS "Mobile Number",
          namespace AS "Namespace",
          country AS "Country",
          state AS "State",
          district AS "District",
          pincode AS "Pincode",
          GSTIN AS "GSTIN",
          category AS "Category",
          region AS "Region",
          device_count AS "Device Count",
          expiry_date AS "Expiry Date"
        FROM EntityMaster
        WHERE namespace LIKE CONCAT(?, '-%') AND mark_deletion = 0
        ORDER BY namespace, entityname
      `;
      params = [namespace];
    } else if (namespaceParts.length === 3) {
      // L2: Fetch only the specific entity
      query = `
        SELECT 
          entityid AS id,
          entityname AS "Entity Name",
          contactfirstname AS "First Name",
          contactlastname AS "Last Name",
          email AS "Email Id",
          mobile AS "Mobile Number",
          namespace AS "Namespace",
          country AS "Country",
          state AS "State",
          district AS "District",
          pincode AS "Pincode",
          GSTIN AS "GSTIN",
          category AS "Category",
          region AS "Region",
          device_count AS "Device Count",
          expiry_date AS "Expiry Date"
        FROM EntityMaster
        WHERE namespace = ? AND mark_deletion = 0
      `;
      params = [namespace];
    } else {
      return res.status(400).json({ message: "Invalid namespace structure." });
    }

    // Execute the query to fetch additional records
    const [rows] = await pool.query(query, params);

    // Add the current entity to the top of the results
    const result = [
      {
        id: currentEntity.entityid,
        "Entity Name": currentEntity.entityname,
        "First Name": currentEntity.contactfirstname,
        "Last Name": currentEntity.contactlastname,
        "Email Id": currentEntity.email,
        "Mobile Number": currentEntity.mobile,
        Namespace: currentEntity.namespace,
        Country: currentEntity.country,
        State: currentEntity.state,
        District: currentEntity.district,
        Pincode: currentEntity.pincode,
        GSTIN: currentEntity.GSTIN,
        Category: currentEntity.category,
        Region: currentEntity.region,
        "Device Count": currentEntity.device_count,
        "Expiry Date": currentEntity.expiry_date,
      },
      ...rows,
    ];

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching records:", error);
    res
      .status(500)
      .json({ message: "Error fetching records", error: error.message });
  }
});

module.exports = router;

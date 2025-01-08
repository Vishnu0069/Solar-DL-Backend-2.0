// const express = require("express");
// const pool = require("../../db"); // Ensure this points to your database connection file
// const router = express.Router();

// router.get("/fetchDisabledUsers", async (req, res) => {
//   const { entityid } = req.query;

//   // Validate input
//   if (!entityid) {
//     return res.status(400).json({ message: "entityid parameter is required" });
//   }

//   try {
//     // Query to fetch all disabled users under the given entityid
//     const [rows] = await pool.query(
//       `
//       SELECT
//         user_id AS "userId",
//         first_name AS "firstName",
//         last_name AS "lastName",
//         email AS "email",
//         mobile_number AS "mobileNumber",
//         user_role AS "role"
//       FROM gsai_user
//       WHERE entityid = ? AND delete_flag = 1
//       `,
//       [entityid]
//     );

//     // Check if there are any matching users
//     if (rows.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No disabled users found for the given entityid" });
//     }

//     // Respond with the formatted data
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error("Error fetching disabled users:", error);
//     res.status(500).json({
//       message: "Error fetching disabled users",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;

//Via namespace 08/01/25
const express = require("express");
const pool = require("../../db"); // Ensure this points to your database connection file
const router = express.Router();

router.get("/fetchDisabledUsers", async (req, res) => {
  const { entityid } = req.query;

  // Validate input
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
      // L0: Fetch disabled users for all entities under the namespace L1 and L2
      query = `
        SELECT 
          u.user_id AS "userId",
          u.first_name AS "firstName",
          u.last_name AS "lastName",
          u.email AS "email",
          u.mobile_number AS "mobileNumber",
          u.user_role AS "role",
          e.namespace AS "namespace",
          e.entityid AS "entityId",
          e.entityname AS "entityName"
        FROM gsai_user u
        INNER JOIN EntityMaster e ON u.entityid = e.entityid
        WHERE e.namespace LIKE CONCAT(?, '%') AND u.delete_flag = 1
      `;
      params = [namespace];
    } else if (namespaceParts.length === 2) {
      // L1: Fetch disabled users for all entities under the namespace L2, considering duplicate namespaces
      query = `
        SELECT 
          u.user_id AS "userId",
          u.first_name AS "firstName",
          u.last_name AS "lastName",
          u.email AS "email",
          u.mobile_number AS "mobileNumber",
          u.user_role AS "role",
          e.namespace AS "namespace",
          e.entityid AS "entityId",
          e.entityname AS "entityName"
        FROM gsai_user u
        INNER JOIN EntityMaster e ON u.entityid = e.entityid
        WHERE e.namespace LIKE CONCAT(?, '-%') AND u.delete_flag = 1
      `;
      params = [namespace];
    } else {
      // L2: Fetch only disabled users for the specific entity
      query = `
        SELECT 
          u.user_id AS "userId",
          u.first_name AS "firstName",
          u.last_name AS "lastName",
          u.email AS "email",
          u.mobile_number AS "mobileNumber",
          u.user_role AS "role",
          e.namespace AS "namespace",
          e.entityid AS "entityId",
          e.entityname AS "entityName"
        FROM gsai_user u
        INNER JOIN EntityMaster e ON u.entityid = e.entityid
        WHERE e.namespace = ? AND u.delete_flag = 1
      `;
      params = [namespace];
    }

    // Execute the query
    const [rows] = await pool.query(query, params);

    // Check if there are any matching users
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No disabled users found for the given entityid" });
    }

    // Respond with the formatted data
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching disabled users:", error);
    res.status(500).json({
      message: "Error fetching disabled users",
      error: error.message,
    });
  }
});

module.exports = router;

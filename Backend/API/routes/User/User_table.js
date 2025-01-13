// const express = require("express");
// const pool = require("../../db");
// const router = express.Router();

// router.get("/getUsersByEntity", async (req, res) => {
//   const { entityid } = req.query;

//   if (!entityid) {
//     return res.status(400).json({ message: "entityid parameter is required" });
//   }

//   try {
//     const [users] = await pool.query(
//       `SELECT
//           user_id AS userId,
//           first_name AS firstName,
//           last_name AS lastName,
//           email AS emailId,
//           mobile_number AS mobileNo,
//           user_role AS role
//        FROM gsai_user
//        WHERE entityid = ? AND delete_flag = 0`, // Excluding deleted users
//       [entityid]
//     );

//     if (users.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No users found under the specified entity ID" });
//     }

//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users by entity:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// });

// module.exports = router;

// //Below is the one with the user type too

// const express = require("express");
// const pool = require("../../db");
// const router = express.Router();

// router.get("/getUsersByEntity", async (req, res) => {
//   const { entityid } = req.query;

//   if (!entityid) {
//     return res.status(400).json({ message: "entityid parameter is required" });
//   }

//   try {
//     const [users] = await pool.query(
//       `SELECT
//           user_id AS userId,
//           first_name AS firstName,
//           last_name AS lastName,
//           email AS emailId,
//           mobile_number AS mobileNo,
//           user_role AS role,
//           user_type AS userType  -- Added user_type
//        FROM gsai_user
//        WHERE entityid = ? AND delete_flag = 0`, // Excluding deleted users
//       [entityid]
//     );

//     if (users.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No users found under the specified entity ID" });
//     }

//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users by entity:", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// });

// module.exports = router;

//With updated Namespace -VP

const express = require("express");
const pool = require("../../db");
const router = express.Router();
const auth = require("../../middleware/auth");

router.get("/getUsersByEntity", auth, async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    // Fetch the namespace and entity name of the given entity
    const [entityData] = await pool.query(
      `SELECT namespace, entityname FROM EntityMaster WHERE entityid = ?`,
      [entityid]
    );

    if (entityData.length === 0) {
      return res.status(404).json({ message: "Entity not found" });
    }

    const namespace = entityData[0].namespace;
    const entityName = entityData[0].entityname;
    const namespaceParts = namespace.split("-");

    let query;
    let params;

    if (namespaceParts.length === 1) {
      // L0: Fetch all users belonging to entities with a namespace starting with GREENSAGEAI-
      query = `
        SELECT 
          u.user_id AS userId,
          u.first_name AS firstName,
          u.last_name AS lastName,
          u.email AS emailId,
          u.mobile_number AS mobileNo,
          u.user_role AS role,
          u.user_type AS userType,
          e.namespace AS namespace,
          e.entityname AS entityName
        FROM gsai_user u
        INNER JOIN EntityMaster e ON u.entityid = e.entityid
        WHERE e.namespace LIKE CONCAT(?, '%') AND u.delete_flag = 0
        ORDER BY 
          CASE WHEN e.entityid = ? THEN 0 ELSE 1 END, 
          e.namespace, u.first_name
      `;
      params = [namespace, entityid];
    } else if (namespaceParts.length === 2) {
      // L1: Fetch all users belonging to entities with a namespace starting with GREENSAGEAI-SomeEntity-
      query = `
        SELECT 
          u.user_id AS userId,
          u.first_name AS firstName,
          u.last_name AS lastName,
          u.email AS emailId,
          u.mobile_number AS mobileNo,
          u.user_role AS role,
          u.user_type AS userType,
          e.namespace AS namespace,
          e.entityname AS entityName
        FROM gsai_user u
        INNER JOIN EntityMaster e ON u.entityid = e.entityid
        WHERE e.namespace LIKE CONCAT(?, '%') AND u.delete_flag = 0
        ORDER BY 
          CASE WHEN e.entityid = ? THEN 0 ELSE 1 END, 
          e.namespace, u.first_name
      `;
      params = [namespace, entityid];
    } else if (namespaceParts.length === 3) {
      // L2: Fetch only the users belonging to the specific entity
      query = `
        SELECT 
          u.user_id AS userId,
          u.first_name AS firstName,
          u.last_name AS lastName,
          u.email AS emailId,
          u.mobile_number AS mobileNo,
          u.user_role AS role,
          u.user_type AS userType,
          e.namespace AS namespace,
          e.entityname AS entityName
        FROM gsai_user u
        INNER JOIN EntityMaster e ON u.entityid = e.entityid
        WHERE e.namespace = ? AND u.delete_flag = 0
        ORDER BY u.first_name
      `;
      params = [namespace];
    } else {
      return res.status(400).json({ message: "Invalid namespace structure." });
    }

    // Execute the query
    const [users] = await pool.query(query, params);

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for the specified namespace" });
    }

    res.status(200).json(users); // Returning users with entity name included in each record
  } catch (error) {
    console.error("Error fetching users by namespace:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;

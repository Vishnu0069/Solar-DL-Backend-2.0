// const express = require("express");
// const pool = require("../../db"); // Database connection
// const router = express.Router();

// router.post("/factoryroles/allroles", async (req, res) => {
//   const { user_type } = req.body;

//   // Validate input
//   if (!user_type) {
//     return res.status(400).json({ message: "Missing required fields." });
//   }

//   try {
//     // Fetch all roles, modules, widgets, and permissions for the given user type
//     const [records] = await pool.query(
//       `SELECT user_role, module_name, widget_name, permission
//        FROM Factory_roles
//        WHERE user_type = ?;`,
//       [user_type]
//     );

//     if (records.length === 0) {
//       return res.status(404).json({
//         message: "No records found for the given user type.",
//       });
//     }

//     // Group data by user_role, then module_name
//     const groupedRoles = records.reduce((acc, row) => {
//       const { user_role, module_name, widget_name, permission } = row;

//       if (!acc[user_role]) {
//         acc[user_role] = {};
//       }

//       if (!acc[user_role][module_name]) {
//         acc[user_role][module_name] = [];
//       }

//       acc[user_role][module_name].push({ widget_name, permission });
//       return acc;
//     }, {});

//     // Format the response
//     const formattedResponse = {
//       user_type,
//       roles: groupedRoles,
//     };

//     // Return the formatted response
//     res.status(200).json(formattedResponse);
//   } catch (error) {
//     console.error("Error fetching roles, modules, and widgets:", error);
//     res.status(500).json({
//       message: "Error fetching roles, modules, and widgets",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const pool = require("../../db"); // Database connection
const router = express.Router();

router.post("/factoryroles/allroles", async (req, res) => {
  const { user_type, user_value } = req.body;

  // Validate input
  if (!user_type) {
    return res
      .status(400)
      .json({ message: "Missing required field: user_type." });
  }

  if (!user_value) {
    // Return empty array if user_value is not provided
    return res.status(200).json({
      user_type,
      user_value: null,
      roles: [],
    });
  }

  try {
    // Fetch all roles, modules, widgets, and permissions for the given user type and user value
    const [records] = await pool.query(
      `SELECT user_role, module_name, widget_name, permission
       FROM Factory_roles
       WHERE user_type = ? AND user_value = ?;`,
      [user_type, user_value]
    );

    if (records.length === 0) {
      // Return empty array if no matching records are found
      return res.status(200).json({
        user_type,
        user_value,
        roles: [],
      });
    }

    // Group data by user_role, then module_name
    const groupedRoles = records.reduce((acc, row) => {
      const { user_role, module_name, widget_name, permission } = row;

      if (!acc[user_role]) {
        acc[user_role] = {};
      }

      if (!acc[user_role][module_name]) {
        acc[user_role][module_name] = [];
      }

      acc[user_role][module_name].push({ widget_name, permission });
      return acc;
    }, {});

    // Format the response
    const formattedResponse = {
      user_type,
      user_value,
      roles: groupedRoles,
    };

    // Return the formatted response
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error fetching roles, modules, and widgets:", error);
    res.status(500).json({
      message: "Error fetching roles, modules, and widgets",
      error: error.message,
    });
  }
});

module.exports = router;

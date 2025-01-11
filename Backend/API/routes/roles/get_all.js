const express = require("express");
const pool = require("../../db"); // Database connection
const router = express.Router();

router.post("/factoryroles/allmodules", async (req, res) => {
  const { user_role, user_type } = req.body;

  // Validate input
  if (!user_role || !user_type) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Fetch all modules, widgets, and permissions for the given role and type
    const [records] = await pool.query(
      `SELECT module_name, widget_name, permission
       FROM Factory_roles
       WHERE user_role = ? AND user_type = ?;`,
      [user_role, user_type]
    );

    if (records.length === 0) {
      return res.status(404).json({
        message: "No records found for the given user role and user type.",
      });
    }

    // Group data by module_name
    const groupedModules = records.reduce((acc, row) => {
      const { module_name, widget_name, permission } = row;
      if (!acc[module_name]) {
        acc[module_name] = [];
      }
      acc[module_name].push({ widget_name, permission });
      return acc;
    }, {});

    // Format the response
    const formattedResponse = {
      user_role,
      user_type,
      modules: groupedModules,
    };

    // Return the formatted response
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error fetching modules and widgets:", error);
    res.status(500).json({
      message: "Error fetching modules and widgets",
      error: error.message,
    });
  }
});

module.exports = router;

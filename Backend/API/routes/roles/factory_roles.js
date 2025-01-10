const express = require("express");
const pool = require("../../db"); // Database connection
const router = express.Router();

router.post("/factoryroles", async (req, res) => {
  const { user_role, user_type, module_name } = req.body;

  // Validate input
  if (!user_role || !user_type || !module_name) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Fetch widgets and permissions for the given role, type, and module
    const [widgets] = await pool.query(
      `SELECT widget_name, permission
       FROM Factory_roles
       WHERE user_role = ? AND user_type = ? AND module_name = ?;`,
      [user_role, user_type, module_name]
    );

    if (widgets.length === 0) {
      return res.status(404).json({
        message:
          "No widgets found for the given user role, user type, and module name.",
      });
    }

    // Return the results as JSON
    res.status(200).json({
      module_name,
      user_role,
      user_type,
      widgets,
    });
  } catch (error) {
    console.error("Error fetching widgets and permissions:", error);
    res.status(500).json({
      message: "Error fetching widgets and permissions",
      error: error.message,
    });
  }
});

module.exports = router;

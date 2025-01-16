const mysql = require("mysql2/promise");

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "your_username",
  password: "your_password",
  database: "your_database",
};

// Permissions data for L2 sys admin
const permissions = [
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Entity",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Entity Table",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Add Entity",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Edit Entity",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Plant",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Plant Table",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Add Plant",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Edit Plant",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Role",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "User",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "User Table",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Add User",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Edit User",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Catalog",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Report Templates",
    permission: "yes",
    user_value: "L2",
  },
  {
    user_type: "entity_user",
    user_role: "sys admin",
    module_name: "Admin",
    widget_name: "Settings",
    permission: "yes",
    user_value: "L2",
  },
];

(async () => {
  let connection;

  try {
    // Establish database connection
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to the database.");

    // Delete existing records for sys admin with user_value = L2
    await connection.execute(
      `DELETE FROM Factory_roles WHERE user_role = ? AND user_value = ?`,
      ["sys admin", "L2"]
    );
    console.log("Deleted existing records for L2 sys admin.");

    // Insert permissions
    const insertQuery = `INSERT INTO Factory_roles (user_type, user_role, module_name, widget_name, permission, user_value) VALUES (?, ?, ?, ?, ?, ?)`;

    for (const perm of permissions) {
      await connection.execute(insertQuery, [
        perm.user_type,
        perm.user_role,
        perm.module_name,
        perm.widget_name,
        perm.permission,
        perm.user_value,
      ]);
    }

    console.log("Inserted permissions for L2 sys admin successfully.");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed.");
    }
  }
})();

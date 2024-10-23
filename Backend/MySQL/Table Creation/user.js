require('dotenv').config();
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Get the table name from the environment variables
const userTableName = process.env.USER;

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

// SQL statement to check if the table exists
const checkTableQuery = `
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = '${process.env.DB_DATABASE}' AND table_name = '${userTableName}'
`;

// SQL statement to create the table with indexes
const createTableQuery = `
  CREATE TABLE ${userTableName} (
    user_id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    INDEX (first_name),
    INDEX (last_name),
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid)
  )
`;

// Check if the table exists
connection.query(checkTableQuery, (err, results) => {
  if (err) {
    console.error('Error checking table existence:', err.stack);
    return;
  }
  const tableExists = results[0]['COUNT(*)'] > 0;
  if (tableExists) {
    console.log(`Table ${userTableName} already exists.`);
    connection.end();
  } else {
    // Execute the SQL statement to create the table
    connection.query(createTableQuery, (err, results) => {
      if (err) {
        console.error('Error creating table:', err.stack);
        return;
      }
      console.log('Table created successfully.');
      connection.end();
    });
  }
});

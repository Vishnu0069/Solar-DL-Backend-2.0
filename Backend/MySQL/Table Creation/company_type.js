require('dotenv').config();
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

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
  WHERE table_schema = '${process.env.DB_DATABASE}' AND table_name = 'company_type'
`;

// SQL statement to create the company_type table
const createTableQuery = `
  CREATE TABLE company_type (
    company_type_id INT AUTO_INCREMENT PRIMARY KEY,
    company_type_name VARCHAR(30) UNIQUE
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
    console.log('Table company_type already exists.');
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

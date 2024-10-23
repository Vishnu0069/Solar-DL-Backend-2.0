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
  WHERE table_schema = '${process.env.DB_DATABASE}' AND table_name = 'gsai_company_master'
`;

// SQL statement to create the table with indexes
const createTableQuery = `
  CREATE TABLE gsai_company_master (
    company_id UUID PRIMARY KEY,
    master_company_id UUID,
    company_type_id INT,
    company_category VARCHAR(30),
    company_name VARCHAR(50),
    country VARCHAR(30),
    region VARCHAR(30),
    state VARCHAR(30),
    district VARCHAR(30),
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    pincode INT,
    owner_first_name VARCHAR(50),
    owner_last_name VARCHAR(50),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN,
    authorization_mode INT,
    FOREIGN KEY (company_type_id) REFERENCES company_type(company_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (master_company_id),
    INDEX (company_type_id),
    INDEX (company_category),
    INDEX (company_name),
    INDEX (country),
    INDEX (region),
    INDEX (state),
    INDEX (district),
    INDEX (owner_first_name),
    INDEX (owner_last_name),
    INDEX (create_date),
    INDEX (last_update_date)
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
    console.log('Table gsai_company_master already exists.');
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

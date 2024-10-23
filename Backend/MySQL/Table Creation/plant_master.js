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
  WHERE table_schema = '${process.env.DB_DATABASE}' AND table_name = 'gsai_plant_master'
`;

// SQL statement to create the table with indexes
const createTableQuery = `
  CREATE TABLE gsai_plant_master (
    plant_id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    plant_serial_number VARCHAR(15),
    plant_name VARCHAR(30) NOT NULL,
    plant_type VARCHAR(30) NOT NULL,
    plant_category VARCHAR(30) NOT NULL,
    plant_capacity FLOAT,
    plant_capacity_uom VARCHAR(5) DEFAULT 'KW',
    country VARCHAR(30) NOT NULL,
    region VARCHAR(30) NOT NULL,
    state VARCHAR(30) NOT NULL,
    district VARCHAR(30) NOT NULL,
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    pincode VARCHAR(8),
    owner_first_name VARCHAR(50) NOT NULL,
    owner_last_name VARCHAR(50) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    time_zone VARCHAR(10) DEFAULT '+5:30 GMT',
    dst VARCHAR(6) DEFAULT '0:00',
    create_date DATETIME NOT NULL,
    last_update_date DATETIME NOT NULL,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    INDEX (company_id),
    INDEX (plant_serial_number),
    INDEX (plant_name),
    INDEX (plant_type),
    INDEX (plant_category),
    INDEX (plant_capacity_uom),
    INDEX (country),
    INDEX (region),
    INDEX (state),
    INDEX (district),
    INDEX (owner_first_name),
    INDEX (owner_last_name),
    INDEX (time_zone),
    INDEX (create_date),
    INDEX (last_update_date),
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
    console.log('Table gsai_plant_master already exists.');
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

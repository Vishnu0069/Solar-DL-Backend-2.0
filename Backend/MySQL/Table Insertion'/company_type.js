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

// Data to be inserted
const companyTypes = [
  { id: 1001, name: 'Green SageAI' },
  { id: 1002, name: 'Integrator' },
  { id: 1003, name: 'Large Power Producer' },
  { id: 1004, name: 'Commercial and Factory' }
];

// SQL statement to insert data
const insertQuery = 'INSERT INTO company_type (company_type_id, company_type_name) VALUES ?';

// Prepare data for insertion
const values = companyTypes.map(type => [type.id, type.name]);

// Execute the SQL statement
connection.query(insertQuery, [values], (err, results) => {
  if (err) {
    console.error('Error inserting data:', err.stack);
    return;
  }
  console.log('Data inserted successfully.');
  connection.end();
});

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

// Dummy data to be inserted
const userData = [
  {
    user_id: 'c1b2d3e4-5678-90ab-cdef-1234567890ab',
    company_id: 'd6f1c7a2-1234-4f5e-8f29-8437ff9e6b91',
    first_name: 'Alice',
    last_name: 'Smith',
    create_date: new Date(),
    last_update_date: new Date(),
    create_by_userid: 'a7d8e8d4-3456-4c7e-9d3a-8437ff9e6b91',
    last_update_userid: 'a7d8e8d4-3456-4c7e-9d3a-8437ff9e6b91',
    delete_flag: false
  },
  {
    user_id: 'd2c3b4a5-6789-01bc-def2-3456789012cd',
    company_id: 'd6f1c7a2-1234-4f5e-8f29-8437ff9e6b91',
    first_name: 'Bob',
    last_name: 'Johnson',
    create_date: new Date(),
    last_update_date: new Date(),
    create_by_userid: 'b8e7f9d3-4567-4d8e-9e3a-8437ff9e6b92',
    last_update_userid: 'b8e7f9d3-4567-4d8e-9e3a-8437ff9e6b92',
    delete_flag: false
  },
  // Add more dummy data as needed
];

// SQL statement to insert data
const insertQuery = `
  INSERT INTO gsai_user (
    user_id, company_id, first_name, last_name, create_date, last_update_date, 
    create_by_userid, last_update_userid, delete_flag
  ) VALUES ?
`;

// Prepare data for insertion
const values = userData.map(user => [
  user.user_id, user.company_id, user.first_name, user.last_name, user.create_date, 
  user.last_update_date, user.create_by_userid, user.last_update_userid, user.delete_flag
]);

// Execute the SQL statement
connection.query(insertQuery, [values], (err, results) => {
  if (err) {
    console.error('Error inserting data:', err.stack);
    return;
  }
  console.log('Data inserted successfully.');
  connection.end();
});

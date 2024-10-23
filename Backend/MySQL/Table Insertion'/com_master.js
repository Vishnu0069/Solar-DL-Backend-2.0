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
const companyMasters = [
  {
    company_id: 'd6f1c7a2-1234-4f5e-8f29-8437ff9e6b91',
    master_company_id: 'f7b8e7d3-2345-4a6e-9b2a-8437ff9e6b91',
    company_type_id: 1001,
    company_category: 'Energy',
    company_name: 'Green SageAI',
    country: 'USA',
    region: 'North America',
    state: 'California',
    district: 'Los Angeles',
    address_line1: '123 Solar St',
    address_line2: 'Suite 101',
    pincode: 90001,
    owner_first_name: 'John',
    owner_last_name: 'Doe',
    create_date: new Date(),
    last_update_date: new Date(),
    create_by_userid: 'a7d8e8d4-3456-4c7e-9d3a-8437ff9e6b91',
    last_update_userid: 'a7d8e8d4-3456-4c7e-9d3a-8437ff9e6b91',
    delete_flag: false,
    authorization_mode: 1
  },
  // Add more data as needed
];

// SQL statement to insert data
const insertQuery = `
  INSERT INTO gsai_company_master (
    company_id, master_company_id, company_type_id, company_category, company_name, country,
    region, state, district, address_line1, address_line2, pincode, owner_first_name, 
    owner_last_name, create_date, last_update_date, create_by_userid, last_update_userid, 
    delete_flag, authorization_mode
  ) VALUES ?
`;

// Prepare data for insertion
const values = companyMasters.map(company => [
  company.company_id, company.master_company_id, company.company_type_id, company.company_category, 
  company.company_name, company.country, company.region, company.state, company.district, 
  company.address_line1, company.address_line2, company.pincode, company.owner_first_name, 
  company.owner_last_name, company.create_date, company.last_update_date, company.create_by_userid, 
  company.last_update_userid, company.delete_flag, company.authorization_mode
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

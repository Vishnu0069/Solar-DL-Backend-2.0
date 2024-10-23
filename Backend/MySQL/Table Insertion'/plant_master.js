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
const plantData = [
  {
    plant_id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
    company_id: 'd6f1c7a2-1234-4f5e-8f29-8437ff9e6b91',
    plant_serial_number: 'SN12345',
    plant_name: 'Solar Plant 1',
    plant_type: 'Solar',
    plant_category: 'Energy',
    plant_capacity: 100.5,
    plant_capacity_uom: 'KW',
    country: 'USA',
    region: 'North America',
    state: 'California',
    district: 'Los Angeles',
    address_line1: '123 Solar St',
    address_line2: 'Suite 101',
    pincode: '90001',
    owner_first_name: 'Jane',
    owner_last_name: 'Doe',
    latitude: 34.0522,
    longitude: -118.2437,
    time_zone: '+5:30 GMT',
    dst: '0:00',
    create_date: new Date(),
    last_update_date: new Date(),
    create_by_userid: 'a7d8e8d4-3456-4c7e-9d3a-8437ff9e6b91',
    last_update_userid: 'a7d8e8d4-3456-4c7e-9d3a-8437ff9e6b91',
    delete_flag: false
  },
  // Add more dummy data as needed
];

// SQL statement to insert data
const insertQuery = `
  INSERT INTO gsai_plant_master (
    plant_id, company_id, plant_serial_number, plant_name, plant_type, plant_category, plant_capacity, 
    plant_capacity_uom, country, region, state, district, address_line1, address_line2, pincode, 
    owner_first_name, owner_last_name, latitude, longitude, time_zone, dst, create_date, last_update_date, 
    create_by_userid, last_update_userid, delete_flag
  ) VALUES ?
`;

// Prepare data for insertion
const values = plantData.map(plant => [
  plant.plant_id, plant.company_id, plant.plant_serial_number, plant.plant_name, plant.plant_type, 
  plant.plant_category, plant.plant_capacity, plant.plant_capacity_uom, plant.country, plant.region, 
  plant.state, plant.district, plant.address_line1, plant.address_line2, plant.pincode, 
  plant.owner_first_name, plant.owner_last_name, plant.latitude, plant.longitude, 
  plant.time_zone, plant.dst, plant.create_date, plant.last_update_date, 
  plant.create_by_userid, plant.last_update_userid, plant.delete_flag
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

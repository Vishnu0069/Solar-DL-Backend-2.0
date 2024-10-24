const mysql = require('mysql');
require('dotenv').config(); // Load environment variables from .env

const pool = mysql.createPool({
    connectionLimit: 100000,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: 10000
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    
    console.log('Connected to the database');

    // Query to list all tables in the database
    const sql = 'SHOW TABLES';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tables:', err);
            connection.release();  // Release the connection
            return;
        }

        console.log('Tables in the database:');
        results.forEach((table) => {
            console.log(table);
        });

        connection.release();  // Release the connection back to the pool
    });
});

const mysql = require('mysql');
require('dotenv').config(); // Make sure dotenv is loaded here if you're using environment variables

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

let connection;

function handleDisconnect() {
    connection = mysql.createConnection(dbConfig); // Create the connection using the configuration

    connection.connect(err => {
        if (err) {
            console.error('Error connecting to the database:', err);
            setTimeout(handleDisconnect, 2000); // Try to reconnect every 2 seconds if connection fails
        } else {
            console.log('Successfully connected to the database.');
        }
    });

    connection.on('error', function(err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
            console.error('Database connection was lost, attempting to reconnect...');
            handleDisconnect(); // Reconnect if the connection is dropped
        } else {
            console.error('Database error not related to connection loss:', err);
            throw err;
        }
    });
}

handleDisconnect();

module.exports = connection;

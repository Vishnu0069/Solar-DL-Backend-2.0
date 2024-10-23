// Start of code block

// Import necessary modules and initialize Express application
// This setup includes essential middleware and routes for handling different aspects of the plant management system
// Written by Vishnu Prasad S
// Written on Date 25-04-2024
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const loginRoutes = require('./routes/loginRoutesVp');
//const plantDetailsRoutes = require('./routes/plantDetailsRoutes');
const installationRoutes = require('./routes/installationRoutes');
const plantRoutes = require('./routes/PlantCountForm');
const totalCapacityRoutes = require('./routes/totalCapacityRoutes');
const top_performers = require('./routes/Topperforming');
const top_energy = require('./routes/Top-Energy');
const esti_actual = require('./routes/Esti-Actual');
const total_plants = require('./routes/totalPlantsRoutes');
const states = require('./routes/States')
const district = require('./routes/District')
const plant_type = require('./routes/plant-type')
const sys_type = require('./routes/sys-type')
const change_pass = require('./routes/Channge-pass');
const profile = require('./routes/profile');
const all_plants = require('./routes/all-plants')
const sync=require('./routes/sync');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3001;// Define the port number to listen on

// Setup a MySQL database connection pool
// Configuration is pulled from environment variables for security
const pool = mysql.createPool({
    connectionLimit: 100000, // the number of connections Node.js will open to our MySQL server
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Middleware to use database connection for each request
app.use((req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // Handle connection errors immediately
        console.log('connected as id ' + connection.threadId);

        // Attach connection to request and ensure it's released after response
        req.db = connection;
        next();
        res.on('finish', () => {
            req.db.release();
        });
    });
});

// Middleware setup
app.use(bodyParser.json());// Parses incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(cors());// Enables CORS with various options.

// Mounting route modules to the application
app.use('/', loginRoutes);
//app.use('/', plantDetailsRoutes);
app.use('/', installationRoutes);
app.use('/', plantRoutes);
app.use('/', totalCapacityRoutes);
app.use('/', top_performers);
app.use('/', top_energy);
app.use('/', esti_actual);
app.use('/',total_plants);
app.use('/',states);
app.use('/',district);
app.use('/',plant_type);
app.use('/',sys_type);
app.use('/',change_pass);
app.use('/',profile);
app.use('/',all_plants);
app.use('/',sync);



// Start the server on the defined port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
// End of code block

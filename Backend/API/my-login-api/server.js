const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const loginRoutes = require('./routes/loginRoutesVp');
const plantDetailsRoutes = require('./routes/plantDetailsRoutes');
const installationRoutes = require('./routes/installationRoutes');
const plantRoutes = require('./routes/PlantCountForm');
const totalCapacityRoutes = require('./routes/totalCapacityRoutes');
const top_performers = require('./routes/Topperforming');
const top_energy = require('./routes/Top-Energy');
const esti_actual = require('./routes/Esti-Actual');
require('dotenv').config(); // Ensure you have dotenv installed via npm

const app = express();
const port = 3001;

// Database connection pool setup
const pool = mysql.createPool({
    connectionLimit: 10, // the number of connections Node.js will open to our MySQL server
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Middleware to use database connection for each request
app.use((req, res, next) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected!
        console.log('connected as id ' + connection.threadId);

        // Once done, release connection
        req.db = connection;
        next();
        res.on('finish', () => {
            req.db.release();
        });
    });
});

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// Use routes
app.use('/', loginRoutes);
app.use('/', plantDetailsRoutes);
app.use('/', installationRoutes);
app.use('/', plantRoutes);
app.use('/', totalCapacityRoutes);
app.use('/', top_performers);
app.use('/',top_energy);
app.use('/',esti_actual)

// Listening to port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


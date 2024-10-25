const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./db');  // Use the DB connection from db folder
const loginRoutes = require('./routes/loginRoutesVp');
const installationRoutes = require('./routes/installationRoutes');
const plantRoutes = require('./routes/PlantCountForm');
const profile = require('./routes/profile');
const sync = require('./routes/sync');
const signup = require('./routes/signup');
const verifyToken = require('./middleware/auth');  // JWT middleware
const sendOtp = require('./routes/sendOtp');
const verifyOtp = require('./routes/verifyOtp');
require('dotenv').config();  // Load environment variables

const app = express();
const port = 3001;  // Define the port number to listen on

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Test route to check if the server is responding
app.get('/test', (req, res) => {
    res.status(200).json({ message: 'Test route is working' });
});

// Use JWT middleware for specific routes that require authentication
app.use('/profile', verifyToken, profile);  // Example: profile route is protected
app.use('/sync', sync);  // Example: public route without JWT

// Mount routes
app.use('/login', loginRoutes);
app.use('/', installationRoutes);
app.use('/', plantRoutes);
app.use('/', signup);
app.use('/send-otp', sendOtp);  // Uncomment OTP routes
app.use('/verify-otp', verifyOtp);

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

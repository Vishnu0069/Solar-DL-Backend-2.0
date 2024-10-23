// Start of code block

// Import necessary modules
// Express for routing, bcryptjs for password hashing, fs for file operations, and database connection
// Written by Vishnu Prasad S
// Written on Date 26-04-2024
const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const router = express.Router();
const connection = require('../config/database');
// Logging function to write operational logs to a file
// This function logs different operations and statuses for troubleshooting and audit purposes.
// Written by Vishnu Prasad S
// Written on Date 26-04-2024
function logToFile(serviceName, operationType, status, message) {
  const now = new Date();
  const timestamp = now.toISOString(); // UTC datetime in ISO format, e.g., "2023-04-01T12:00:00.000Z"
  const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  //const Signin_log = require('../logs/Signin.log')
  fs.appendFile('Signin.log', logMessage, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
}

// POST endpoint for user login
// This endpoint handles user login attempts by validating email and password, and retrieving user roles.
// Written by Vishnu Prasad S
// Written on Date 26-04-2024
router.post('/login', async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;

  // Check for email and password presence
  if (!email || !password) {
    // Log failed login attempt due to incorrect password
    logToFile('UserService', 'Login', 'Failure', `Email and password required`);

    return res.status(400).send('Email and password are required.');

  }

  // Query to check user email and get password hash
  const queryUser = 'SELECT user_id, passwordhashcode FROM gSAi_user_Master WHERE user_email  = ?';
  connection.query(queryUser, [email], async (err, users) => {
    if (err) {
      logToFile('UserService', 'Login', 'Failure', 'Database query error:', err);
      console.error('Database query error:', err);
      return res.status(500).send('Internal server error.');
    }
    if (users.length === 0) {
      logToFile('UserService', 'Login', 'Failure', `No user Found with that email`);
      return res.status(401).send('No user found with that email.');
    }

    // User exists, compare the password
    const user = users[0];
    const passwordIsValid = await bcrypt.compare(password, user.passwordhashcode);

    if (!passwordIsValid) {
      // Log successful login attempt
      logToFile('UserService', 'Login', 'Failure', `Password is inccorect`);
      return res.status(401).send('Password is incorrect.');


    }


    /*// User password is valid, proceed to get user role and plants
    const queryUserRoles = 'SELECT userid, usertype, role FROM user_roles WHERE userid = ?';
    connection.query(queryUserRoles, [user.Userid], (err, roles) => {
      if (err) {
        console.error('Error fetching user roles:', err);
        return res.status(500).send('Internal server error.');
      }*/
    // Fetch the user's role and plants from the user_roles table
    const queryUserRoles = 'SELECT usertype, role, plantid, integratorid FROM gsai_user_role WHERE user_id = ?';
    connection.query(queryUserRoles, [user.Userid], (err, roles) => {
      if (err) {
        logToFile('UserService', 'Login', 'Failure', 'Error fetching user roles:', err);
        console.error('Error fetching user roles:', err);
        return res.status(500).send('Internal server error.');
      }

      // Assuming each user will have one role and at least one plant
      //const userRole = roles[0];

      /*// Fetch plants associated with the user
      const queryPlants = 'SELECT plantid FROM PlantMaster WHERE integratorid = ?';
      connection.query(queryPlants, [userRole.integratorid], (err, plants) => {
        if (err) {
          console.error('Error fetching plants:', err);
          return res.status(500).send('Internal server error.');
        }
 
        // Format the plants into an array
        const plantArray = plants.map(plant => plant.plantid);
 
        // Prepare the response object
        const userData = {
          userid: user.Userid,
          email: email,
          usertype: userRole.usertype,
          role: userRole.role,
          Plants: plantArray,
          logintimestamp: new Date().toISOString()
        };
 
        // Send the successful login response
        res.json({
          message: 'Login successful!',
          userData: userData
        });
      });
    });
  });
});
 
module.exports = router;
*/
      // Process the roles and associated plant IDs
      const plantIds = roles.map(roleEntry => roleEntry.plantid);

      // Prepare the response with the user's details, role, and associated plant IDs
      const userData = {
        userid: user.Userid,
        email: email,
        usertype: roles.length ? roles[0].usertype : null,
        role: roles.length ? roles[0].role : null,
        integratorid: roles.length ? roles[0].integratorid : null,
        Plants: plantIds,
        logintimestamp: new Date().toISOString(),

      };


      // Send the login success response
      res.json({
        message: 'Login successful!',
        userData: userData,

      });
      // Log successful login attempt
      logToFile('UserService', 'Login', 'Success', `User ${email} logged in successfully.`);
    });
  });
});

// Export the router module for use in the main application

module.exports = router;
// End of code block

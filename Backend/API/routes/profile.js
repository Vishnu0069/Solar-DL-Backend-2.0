// POST endpoint for retrieving user profile details
// This endpoint retrieves the country and date of birth for a user.
// Written by Vishnu Prasad S
// Written on Date 26-04-2024

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const fs = require('fs');
const connection = require('../config/database');


function logToFile(serviceName, operationType, status, message) {
    const now = new Date();
    const timestamp = now.toISOString(); // UTC datetime in ISO format, e.g., "2023-04-01T12:00:00.000Z"
    const logMessage = `${timestamp}\t${serviceName}\t${operationType}\t${status}\t${message}\n`;
  
    fs.appendFile('SignIn.log', logMessage, (err) => {
      if (err) console.error('Failed to write to log file:', err);
    });
  }
/*router.post('/profile', async (req, res) => {
    // Extract email from the request body
    const { email } = req.body.userData;
  
    // Check for email presence
    if (!email) {
      logToFile('UserService', 'GetProfile', 'Failure', 'Email is required');
      return res.status(400).send('Email is required.');
    }
  
    // Query to fetch country and date of birth from UserMaster table
    const queryProfile = 'SELECT Country, DateofBirth, User_Email, MobileNumber, First_Name, Last_Name FROM UserMaster WHERE User_Email = ?';
    connection.query(queryProfile, [email], (err, results) => {
      if (err) {
        logToFile('UserService', 'GetProfile', 'Failure', `Database query error: ${err}`);
        return res.status(500).send('Internal server error.');
      }
      if (results.length === 0) {
        logToFile('UserService', 'GetProfile', 'Failure', 'No user found with that email');
        return res.status(404).send('No user found with that email.');
      }
  
      // Assuming only one record per email, return the profile data
      const profileData = results[0];
      res.json({
        message: 'Profile fetched successfully.',
        profileData: {
        Name:profileData.First_Name+profileData.Last_Name,
        PhoneNo: profileData.MobileNumber,
        Email:profileData.User_Email,
          Country: profileData.Country,
          //DateofBirth: profileData.DateofBirth,


        }
      });
      // Log successful profile fetch
      logToFile('UserService', 'GetProfile', 'Success', `Profile fetched successfully for user ${email}`);
    });
  });*/
  router.post('/profile', async (req, res) => {
    const { email } = req.body.userData;

    if (!email) {
        logToFile('UserService', 'GetProfile', 'Failure', 'Email is required');
        return res.status(400).send('Email is required.');
    }

    const queryProfile = 'SELECT UserID, Country, DateofBirth, User_Email, MobileNumber, First_Name, Last_Name FROM UserMaster WHERE User_Email = ?';
    connection.query(queryProfile, [email], (err, results) => {
        if (err) {
            logToFile('UserService', 'GetProfile', 'Failure', `Database query error: ${err}`);
            return res.status(500).send('Internal server error.');
        }
        if (results.length === 0) {
            logToFile('UserService', 'GetProfile', 'Failure', 'No user found with that email');
            return res.status(404).send('No user found with that email.');
        }

        const profileData = results[0];

        // Query user roles based on the UserID fetched
        const queryUserRoles = 'SELECT usertype FROM user_roles WHERE userid = ?';
        connection.query(queryUserRoles, [profileData.UserID], (err, roles) => {
            if (err) {
                logToFile('UserService', 'GetProfile', 'Failure', 'Error fetching user roles:', err);
                return res.status(500).send('Internal server error.');
            }
            if (roles.length === 0) {
                return res.status(404).send('No roles found for the user.');
            }

            // Check user role and query appropriate table
            const userRole = roles.find(role => role.usertype === '1' || role.usertype === '2');
            if (!userRole) {
                return res.status(404).send('Relevant user role not found.');
            }

            let queryAdditionalInfo;
            if (userRole.usertype === '1') {
                queryAdditionalInfo = 'SELECT Region, Country, Owner_FirstName, Owner_LastName, Owner_Mobile, AddressLine1, Pincode, State, IntegratorType FROM IntegratorMaster WHERE Owner_EmailID = ?';
            } else if (userRole.usertype === '2') {
                queryAdditionalInfo = 'SELECT Region, Country, Owner_FirstName, Owner_LastName, Owner_Mobile, AddressLine1, Pincode, State, OwnershipType FROM PlantMaster WHERE Owner_EmailID = ?';
            }

            // Execute the query for additional info based on user role
            connection.query(queryAdditionalInfo, [email], (err, additionalInfo) => {
                if (err) {
                    logToFile('UserService', 'GetProfile', 'Failure', 'Error fetching additional information:', err);
                    return res.status(500).send('Internal server error.');
                }
                if (additionalInfo.length === 0) {
                    return res.status(404).send('No additional information found.');
                }

                // Combine all data into one response
                const additionalData = additionalInfo[0];
                const response = {
                    message: 'Profile fetched successfully.',
                    profileData: {
                        Name: additionalData.Owner_FirstName + " " + additionalData.Owner_LastName,
                        PhoneNo: additionalData.Owner_Mobile,
                        Email: profileData.User_Email,
                        BusinessName: userRole.usertype === '1' ? additionalData.IntegratorType : additionalData.OwnershipType,
                        Address: additionalData.AddressLine1,
                        Country: additionalData.Country,
                        Pincode:additionalData.Pincode,
                        //DateofBirth: profileData.DateofBirth,
                        Region: additionalData.Region,
                        State:additionalData.State,
                       
                    }
                };
                
                res.json(response);
                logToFile('UserService', 'GetProfile', 'Success', `Profile fetched successfully for user ${email}`);
            });
        });
    });
});

  
  module.exports = router;
  
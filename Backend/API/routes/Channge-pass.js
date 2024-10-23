// POST endpoint for changing user password
// This endpoint handles updating user passwords.
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
  
router.post('/change-password', async (req, res) => {
    // Extract email and the new password from the request body
    const { email, newPassword } = req.body;
  
    // Check for email and new password presence
    if (!email || !newPassword) {
      logToFile('UserService', 'ChangePassword', 'Failure', 'Email and new password required');
      return res.status(400).send('Email and new password are required.');
    }
  
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
  
    // Update the user's password hash in the database
    const queryUpdatePassword = 'UPDATE UserMaster SET passwordhashcode = ? WHERE User_Email = ?';
    connection.query(queryUpdatePassword, [hashedPassword, email], (err, result) => {
      if (err) {
        logToFile('UserService', 'ChangePassword', 'Failure', `Database update error: ${err}`);
        return res.status(500).send('Failed to update password.');
      }
      if (result.affectedRows === 0) {
        logToFile('UserService', 'ChangePassword', 'Failure', 'No user found with that email');
        return res.status(404).send('No user found with that email.');
      }
  
      // Log successful password change
      logToFile('UserService', 'ChangePassword', 'Success', `Password changed successfully for user ${email}`);
      res.send('Password updated successfully.');
    });
  });
  
  module.exports = router;
  
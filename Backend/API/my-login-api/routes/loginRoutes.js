// routes/loginRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const connection = require('../db/database');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).send('Email and password are required.');
  }

  const queryUser = 'SELECT Userid, passwordhashcode, User_Email FROM UserMaster WHERE User_Email = ?';
  connection.query(queryUser, [email], async (err, results) => {
      if (err) {
          console.error('Database query error:', err);
          return res.status(500).send('Internal server error.');
      }

      if (results.length === 0) {
          return res.status(401).send('No user found with that email.');
      }

      const user = results[0];
      const passwordHash = user.passwordhashcode;

      if (!passwordHash) {
          return res.status(500).send('Internal server error. No password hash available.');
      }

      const passwordIsValid = await bcrypt.compare(password, passwordHash);

      if (!passwordIsValid) {
          return res.status(401).send('Password is incorrect.');
      }

      // After successful login, fetch the IntegratorID
      const queryIntegrator = 'SELECT IntegratorID FROM IntegratorMaster WHERE Owner_EmailID = ?';
      connection.query(queryIntegrator, [email], (err, integratorResults) => {
          if (err) {
              console.error('Database query error:', err);
              return res.status(500).send('Internal server error.');
          }

          let integratorID = integratorResults.length > 0 ? integratorResults[0].IntegratorID : null;

          // Prepare and send the response including User_id, IntegratorID, and User_Email
          const userData = {
              User_id: user.Userid,
              User_Email: user.User_Email,
              passwordhashcode: passwordHash,  // Consider security implications of sending this
              IntegratorID: integratorID
                // Added User_Email to the response
          };

          console.log({
              message: 'Login successful!',
              userData: userData
          });

          res.send({
              message: 'Login successful!',
              userData: userData
          });
      });
  });
});

module.exports = router;

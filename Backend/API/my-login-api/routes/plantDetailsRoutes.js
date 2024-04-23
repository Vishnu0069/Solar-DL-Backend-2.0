// routes/plantDetailsRoutes.js
/*
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const connection = require('../db/database');  // Ensure your database module is correctly set up

router.post('/GetPlantDetails', (req, res) => {
    const { email, passwordhashcode, IntegratorID } = req.body;

    // First, verify the email and passwordhashcode
    const queryUser = 'SELECT User_Email, passwordhashcode FROM UserMaster WHERE User_Email = ?';
    connection.query(queryUser, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error.');
        }

        if (results.length === 0) {
            return res.status(401).send('No user found with that email.');
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(passwordhashcode, user.passwordhashcode);

        if (!isPasswordValid) {
            return res.status(401).send('Password is incorrect.');
        }

        // If the password is verified, fetch detailed plant information using IntegratorID
       
        const queryPlants = 
            SELECT 
                Plantid, PlantName, PlantType, SystemType, Capacity,
                Owner_FirstName, Owner_LastName, Owner_EmailID, Owner_Mobile,
                Country, Region, State, District, AddressLine1, AddressLine2, Pincode,
                Latitude, Longitude
            FROM PlantMaster
            WHERE IntegratorID = ?`;
        
        connection.query(queryPlants, [IntegratorID], (err, plantResults) => {
            if (err) {
                console.error('Error fetching plant details:', err);
                return res.status(500).send('Failed to fetch plant details');
            }

            // Format the response with detailed plants information
            const plants = plantResults.map(plant => ({
                plantid: plant.Plantid,
                PlantName: plant.PlantName,
                PlantType: plant.PlantType,
                SystemType: plant.SystemType,
                Capacity: plant.Capacity,
                Owner_FirstName: plant.Owner_FirstName,
                Owner_LastName: plant.Owner_LastName,
                Owner_EmailID: plant.Owner_EmailID,
                Owner_Mobile: plant.Owner_Mobile,
                Country: plant.Country,
                Region: plant.Region,
                State: plant.State,
                District: plant.District,
                AddressLine1: plant.AddressLine1,
                AddressLine2: plant.AddressLine2,
                Pincode: plant.Pincode,
                Latitude: plant.Latitude,
                Longitude: plant.Longitude
            }));

            res.status(200).json({ Plants: plants });
        });

        // Query to fetch plant details from PlantMaster where the records match the given IntegratorID
        const queryPlants = `
        SELECT 
            PlantID, PlantName, PlantType, SystemType, Capacity,
            Owner_FirstName, Owner_LastName, Owner_EmailID, Owner_Mobile,
            Country, Region, State, District, AddressLine1, AddressLine2, Pincode,
            Latitude, Longitude
        FROM PlantMaster
        WHERE IntegratorID = ?`;

        connection.query(queryPlants, [IntegratorID], (err, plantResults) => {
        if (err) {
            console.error('Error fetching plant details:', err);
            return res.status(500).send('Failed to fetch plant details');
        }

        // Mapping over each plant result to format it according to the specified structure
        const plants = plantResults.map(plant => ({
            plantid: plant.PlantId,
            PlantName: plant.PlantName,
            PlantType: plant.PlantType,
            SystemType: plant.SystemType,
            Capacity: plant.Capacity,
            Owner_FirstName: plant.Owner_FirstName,
            Owner_LastName: plant.Owner_LastName,
            Owner_EmailID: plant.Owner_EmailID,
            Owner_Mobile: plant.Owner_Mobile,
            Country: plant.Country,
            Region: plant.Region,
            State: plant.State,
            District: plant.District,
            AddressLine1: plant.AddressLine1,
            AddressLine2: plant.AddressLine2,
            Pincode: plant.Pincode,
            Latitude: plant.Latitude,
            Longitude: plant.Longitude
        }));

        res.status(200).json({ Plants: plants });
        });

    });
});

module.exports = router;*/

// routes/plantDetailsRoutes.js
/*
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const connection = require('../db/database');  // Ensure your database connection is properly set up

router.post('/GetPlantDetails', (req, res) => {
    const { email, passwordhashcode, IntegratorID } = req.body;

    // First, verify the user's email and passwordhashcode
    const queryUser = 'SELECT passwordhashcode FROM UserMaster WHERE User_Email = ?';
    connection.query(queryUser, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error.');
        }

        if (results.length === 0) {
            return res.status(401).send('No user found with that email.');
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(passwordhashcode, user.passwordhashcode);

        if (!isPasswordValid) {
            return res.status(401).send('Password is incorrect.');
        }

        // Fetch detailed plant information using IntegratorID upon successful verification
        const queryPlants = `
            SELECT 
                PlantID, PlantName, PlantType, SystemType, Capacity,
                Owner_FirstName, Owner_LastName, Owner_EmailID, Owner_Mobile,
                Country, Region, State, District, AddressLine1, AddressLine2, Pincode,
                Latitude, Longitude,plant_serialno, capacity_uom, azimuthal_angle, inclination_angle, Creation_Date
            FROM PlantMaster
            WHERE IntegratorID = ?`;

        connection.query(queryPlants, [IntegratorID], (err, plantResults) => {
            if (err) {
                console.error('Error fetching plant details:', err);
                return res.status(500).send('Failed to fetch plant details');
            }
            
            //Define Outputes ..
            const plants = plantResults.map(plant => ({
                plantid: plant.PlantID,
                PlantName: plant.PlantName,
                PlantType: plant.PlantType,
                SystemType: plant.SystemType,
                Capacity: plant.Capacity,
                Owner_FirstName: plant.Owner_FirstName,
                Owner_LastName: plant.Owner_LastName,
                Owner_EmailID: plant.Owner_EmailID,
                Owner_Mobile: plant.Owner_Mobile,
                Country: plant.Country,
                Region: plant.Region,
                State: plant.State,
                District: plant.District,
                AddressLine1: plant.AddressLine1,
                AddressLine2: plant.AddressLine2,
                Pincode: plant.Pincode,
                Latitude: plant.Latitude,
                Longitude: plant.Longitude,
                PlantSerialNo: plant.plant_serialno,
                CapacityUOM: plant.capacity_uom,
                AzimuthalAngle: plant.azimuthal_angle,
                InclinationAngle: plant.inclination_angle,
                CreationDate: plant.Creation_Date
              }));
            res.status(200).json({ Plants: plants });
        });
    });
});

module.exports = router;*/

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const connection = require('../db/database'); // This path must correctly point to your database configuration

// Endpoint to handle plant details retrieval
router.post('/GetPlantDetails', (req, res) => {
    const { email, passwordhashcode, IntegratorID } = req.body;

    // First, verify the user's email and passwordhashcode
    const queryUser = 'SELECT passwordhashcode FROM UserMaster WHERE User_Email = ?';
    connection.query(queryUser, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal server error.');
        }

        if (results.length === 0) {
            return res.status(401).send('No user found with that email.');
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(passwordhashcode, user.passwordhashcode);

        if (!isPasswordValid) {
            return res.status(401).send('Password is incorrect.');
        }

        // Fetch detailed plant information using IntegratorID upon successful verification
        const queryPlants = `
            SELECT 
                PlantID, PlantName, PlantType, SystemType, Capacity,
                Owner_FirstName, Owner_LastName, Owner_EmailID, Owner_Mobile,
                Country, Region, State, District, AddressLine1, AddressLine2, Pincode,
                Latitude, Longitude, plant_serialno, capacity_uom, azimuthal_angle, inclination_angle, Creation_Date
            FROM PlantMaster
            WHERE IntegratorID = ?`;

        connection.query(queryPlants, [IntegratorID], (err, plantResults) => {
            if (err) {
                console.error('Error fetching plant details:', err);
                return res.status(500).send('Failed to fetch plant details');
            }

            const plants = plantResults.map(plant => ({
                // Mapping each field from the query result to a response object
                plantid: plant.PlantID,
                PlantName: plant.PlantName,
                PlantType: plant.PlantType,
                SystemType: plant.SystemType,
                Capacity: plant.Capacity,
                Owner_FirstName: plant.Owner_FirstName,
                Owner_LastName: plant.Owner_LastName,
                Owner_EmailID: plant.Owner_EmailID,
                Owner_Mobile: plant.Owner_Mobile,
                Country: plant.Country,
                Region: plant.Region,
                State: plant.State,
                District: plant.District,
                AddressLine1: plant.AddressLine1,
                AddressLine2: plant.AddressLine2,
                Pincode: plant.Pincode,
                Latitude: plant.Latitude,
                Longitude: plant.Longitude,
                PlantSerialNo: plant.plant_serialno,
                CapacityUOM: plant.capacity_uom,
                AzimuthalAngle: plant.azimuthal_angle,
                InclinationAngle: plant.inclination_angle,
                CreationDate: plant.Creation_Date
            }));
            res.status(200).json({ Plants: plants });
        });
    });
});

module.exports = router;

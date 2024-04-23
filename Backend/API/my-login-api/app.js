// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const loginRoutes = require('./routes/loginRoutes');
const plantDetailsRoutes = require('./routes/plantDetailsRoutes'); // Import plant details routes
const installationRoutes = require('./routes/installationRoutes');
const plantRoutes = require('./routes/PlantCountForm'); // adjust path as necessary
const totalCapacityRoutes = require('./routes/totalCapacityRoutes'); // Adjust the path as necessary


const app = express();
const port = 3001;


//Login and Get plant details endpont

app.use(bodyParser.json());
app.use(cors());

// Use routes
app.use('/', loginRoutes);
app.use('/', plantDetailsRoutes);  // Assuming your routes are prefixed with '/api'
app.use('/GetNewInstallations', installationRoutes);
app.use('/', plantRoutes);
app.use('/', totalCapacityRoutes);




//Listing to port   
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

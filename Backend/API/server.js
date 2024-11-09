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
const forgot = require('./routes/forgot-pass');
const checkEmailRoute = require('./routes/checkemail');
const getCountry = require('./routes/Country,state,region,dis/getCountry');
const getRegion1 = require('./routes/Country,state,region,dis/Region1');
const getRegion2 = require('./routes/Country,state,region,dis/Region2');
const getState1 = require('./routes/Country,state,region,dis/State1');
const getState2 = require('./routes/Country,state,region,dis/State2');
const getDistrict = require('./routes/Country,state,region,dis/getDistrict');
//Entity routes
const getEntityDetailsRoute = require('./routes/Entity/getEntityDetails');
const get_entity_details2 = require('./routes/Entity/Get_Entity_details2');
const get_entity_details3 = require('./routes/Entity/Get_Entity_details3');
const get_entity_details4 = require('./routes/Entity/Get_Entity_details4');
const get_entity_details5 = require('./routes/Entity/Get_Entity_details5');
const get_entity_details6 = require('./routes/Entity/Get_Entity_details6');




const getCategories = require('./routes/Entity/category');
const generateentityid = require('./routes/Entity/generateEntityId')
const disable=require('./routes/Entity/markEntityAsDeleted');
const addNewEntityRoute = require('./routes/Entity/addNewEntity');
const fetchEntitiesRoute = require('./routes/Entity/fetchEntities');
const fetchEntityByIdRoute = require('./routes/Entity/fetchEntityById');
const fetchEntityIdsRoute = require('./routes/Entity/fetchEntityIds');
const fetchEntityNamesRoute = require('./routes/Entity/fetchEntityNames');
const fetchAllRecordsRoute = require('./routes/Entity/fetchAllRecords');
const editentity = require('./routes/Entity/editEntity')
//plant routes
const generateplantid = require('./routes/Plant/generatePlantId');
const entitynames = require('./routes/Plant/fetchEntityNames');
const getEntityDetails = require('./routes/Plant/getEntityDetails')
const addplant = require('./routes/Plant/addPlant')
const plant_category = require('./routes/Plant/getPlantCategories')
const fetch_plant = require('./routes/Plant/fetchPlantList');
const disable_plant = require('./routes/Plant/markPlantAsDeleted')
const verify_individual_user = require('./routes/Plant/VerifyIndividualUser');
const Get_plant_type = require('./routes/Plant/Get_plant_type');

//User routes
const Add_User1 = require('./routes/User/Add_User1');
const Get_User_for_edit = require('./routes/User/Get_User_edit');
const edit_user = require('./routes/User/Edit_User');
const table_user = require('./routes/User/User_table');
const edit_plant_user=require('./routes/User/Add_plat_user');
const user_roles=require('./routes/User/User_roles');





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
app.use('/forgot-pass',forgot);
app.use('/', checkEmailRoute);
app.use('/api', getCategories);
app.use('/api', getCountry);
app.use('/api', getRegion1);
app.use('/api', getRegion2);
app.use('/api', getState1);
app.use('/api', getState2);
app.use('/api', getDistrict);
//Entity
app.use('/api/entity', addNewEntityRoute);
app.use('/add-entity',addNewEntityRoute);
app.use('/api/entity', fetchEntitiesRoute);
app.use('/api/entity', fetchEntityByIdRoute);
app.use('/api/entity', fetchEntityIdsRoute);
app.use('/api/entity', fetchEntityNamesRoute);
app.use('/api/entity', fetchAllRecordsRoute);
app.use('/api/entity',editentity);
app.use('/api/entity', getEntityDetailsRoute);
app.use('/api/entity', get_entity_details2);
app.use('/api/entity', get_entity_details3);
app.use('/api/entity', get_entity_details4);
app.use('/api/entity', get_entity_details5);
app.use('/api/entity', get_entity_details6);
app.use('/api/entity', generateentityid);
app.use('/api/entity', disable);
//PLant
app.use('/api/plant',generateplantid);
app.use('/api/plant',entitynames);
app.use('/api/plant',getEntityDetails);
app.use('/api/plant',addplant);
app.use('/api/plant',plant_category);
app.use('/api/plant',fetch_plant);
app.use('/api/plant',disable_plant);
app.use('/api/plant',verify_individual_user);
app.use('/api/plant',Get_plant_type);

//User
app.use('/api/user',Add_User1);
app.use('/api/user',Get_User_for_edit);
app.use('/api/user',edit_user);
app.use('/api/user',table_user);
app.use('/api/user',edit_plant_user)
app.use('/api/user',user_roles)




// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

require('dotenv').config();
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

// Get the table names from the environment variables
const userTableName = process.env.USER_TABLE;
const companyMasterTableName = process.env.COMPANY_MASTER_TABLE;
const companyTypeTableName = process.env.COMPANY_TYPE_TABLE;
const plantMasterTableName = process.env.PLANT_MASTER_TABLE;
const plantUserTableName = process.env.PLANT_USER_TABLE;
const roleTableName = process.env.ROLE_TABLE;
const userRoleTableName = process.env.USER_ROLE_TABLE;
const moduleTableName = process.env.MODULE_TABLE;
const moduleRoleTableName = process.env.MODULE_ROLE_TABLE;
const deviceTypeTableName = process.env.DEVICE_TYPE_TABLE;
const targetFieldTableName = process.env.TARGET_FIELD_TABLE;
const metadataTableName = process.env.METADATA_TABLE;
const metaApiTableName = process.env.META_API_TABLE;
const apiTypeTableName = process.env.API_TYPE_TABLE;
const responseFieldTableName = process.env.RESPONSE_FIELD_TABLE;
const deviceMasterTableName = process.env.DEVICE_MASTER_TABLE;
const apiTableName = process.env.API_TABLE;








// Function to check if a table exists and create it if not
const createTableIfNotExists = (tableName, createTableQuery) => {
  return new Promise((resolve, reject) => {
    const checkTableQuery = `
      SELECT COUNT(*)
      FROM information_schema.tables
      WHERE table_schema = '${process.env.DB_DATABASE}' AND table_name = '${tableName}'
    `;
    connection.query(checkTableQuery, (err, results) => {
      if (err) {
        reject('Error checking table existence: ' + err.stack);
        return;
      }
      const tableExists = results[0]['COUNT(*)'] > 0;
      if (tableExists) {
        console.log(`Table ${tableName} already exists.`);
        resolve();
      } else {
        connection.query(createTableQuery, (err, results) => {
          if (err) {
            reject('Error creating table: ' + err.stack);
            return;
          }
          console.log(`Table ${tableName} created successfully.`);
          resolve();
        });
      }
    });
  });
};

// SQL statements to create the tables
const createUserTableQuery = `
  CREATE TABLE ${userTableName} (
    user_id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    INDEX (first_name),
    INDEX (last_name),
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid)
  )
`;

const createCompanyMasterTableQuery = `
  CREATE TABLE ${companyMasterTableName} (
    company_id UUID PRIMARY KEY,
    master_company_id UUID,
    company_type_id INT,
    company_category VARCHAR(30),
    company_name VARCHAR(50),
    country VARCHAR(30),
    region VARCHAR(30),
    state VARCHAR(30),
    district VARCHAR(30),
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    pincode INT,
    owner_first_name VARCHAR(50),
    owner_last_name VARCHAR(50),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN,
    authorization_mode INT,
    FOREIGN KEY (company_type_id) REFERENCES ${companyTypeTableName}(company_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (master_company_id),
    INDEX (company_type_id),
    INDEX (company_category),
    INDEX (company_name),
    INDEX (country),
    INDEX (region),
    INDEX (state),
    INDEX (district),
    INDEX (owner_first_name),
    INDEX (owner_last_name),
    INDEX (create_date),
    INDEX (last_update_date)
  )
`;

const createCompanyTypeTableQuery = `
  CREATE TABLE ${companyTypeTableName} (
    company_type_id INT AUTO_INCREMENT PRIMARY KEY,
    company_type_name VARCHAR(30) UNIQUE
  )
`;

const createPlantMasterTableQuery = `
  CREATE TABLE ${plantMasterTableName} (
    plant_id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    plant_serial_number VARCHAR(15),
    plant_name VARCHAR(30) NOT NULL,
    plant_type VARCHAR(30) NOT NULL,
    plant_category VARCHAR(30) NOT NULL,
    plant_capacity FLOAT,
    plant_capacity_uom VARCHAR(5) DEFAULT 'KW',
    country VARCHAR(30) NOT NULL,
    region VARCHAR(30) NOT NULL,
    state VARCHAR(30) NOT NULL,
    district VARCHAR(30) NOT NULL,
    address_line1 VARCHAR(100),
    address_line2 VARCHAR(100),
    pincode VARCHAR(8),
    owner_first_name VARCHAR(50) NOT NULL,
    owner_last_name VARCHAR(50) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    time_zone VARCHAR(10) DEFAULT '+5:30 GMT',
    dst VARCHAR(6) DEFAULT '0:00',
    create_date DATETIME NOT NULL,
    last_update_date DATETIME NOT NULL,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    INDEX (company_id),
    INDEX (plant_serial_number),
    INDEX (plant_name),
    INDEX (plant_type),
    INDEX (plant_category),
    INDEX (plant_capacity_uom),
    INDEX (country),
    INDEX (region),
    INDEX (state),
    INDEX (district),
    INDEX (owner_first_name),
    INDEX (owner_last_name),
    INDEX (time_zone),
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (last_update_userid)
  )
`;

// SQL statement to create the gsai_plant_user table
const createPlantUserTableQuery = `
  CREATE TABLE ${plantUserTableName} (
    plant_user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id UUID,
    plant_id UUID,
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES ${userTableName}(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES ${plantMasterTableName}(plant_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createRoleTableQuery = `
  CREATE TABLE ${roleTableName} (
    role_id UUID PRIMARY KEY,
    company_id UUID,
    role_name VARCHAR(15),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (company_id) REFERENCES ${companyMasterTableName}(company_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (role_name),
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;
const createUserRoleTableQuery = `
  CREATE TABLE ${userRoleTableName} (
    user_role_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id UUID,
    role_id UUID,
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES ${userTableName}(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES ${roleTableName}(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createModuleTableQuery = `
  CREATE TABLE ${moduleTableName} (
    module_id UUID PRIMARY KEY,
    module_type VARCHAR(15) NOT NULL,
    module_name VARCHAR(15),
    desk_show BOOLEAN DEFAULT FALSE,
    app_show BOOLEAN DEFAULT FALSE,
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    INDEX (module_type),
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createModuleRoleTableQuery = `
  CREATE TABLE ${moduleRoleTableName} (
    module_role_id INT AUTO_INCREMENT PRIMARY KEY,
    module_id UUID,
    role_id UUID,
    can_create BOOLEAN DEFAULT FALSE,
    can_read BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_disable BOOLEAN DEFAULT FALSE,
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (module_id) REFERENCES ${moduleTableName}(module_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES ${roleTableName}(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createDeviceTypeTableQuery = `
  CREATE TABLE ${deviceTypeTableName} (
    device_type_id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(15),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    INDEX (device_name),
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createTargetFieldTableQuery = `
  CREATE TABLE ${targetFieldTableName} (
    field_list_id INT AUTO_INCREMENT PRIMARY KEY,
    device_type_id INT,
    header VARCHAR(30),
    target_fields VARCHAR(500),
    summary_fields VARCHAR(500),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (device_type_id) REFERENCES ${deviceTypeTableName}(device_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createMetadataTableQuery = `
  CREATE TABLE ${metadataTableName} (
    metadata_id UUID PRIMARY KEY,
    device_type_id INT,
    make VARCHAR(10),
    model VARCHAR(10),
    version VARCHAR(10),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (device_type_id) REFERENCES ${deviceTypeTableName}(device_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (make),
    INDEX (model),
    INDEX (version),
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createMetaApiTableQuery = `
  CREATE TABLE ${metaApiTableName} (
    meta_api_id INT AUTO_INCREMENT PRIMARY KEY,
    metadata_id UUID,
    api_id INT,
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (metadata_id) REFERENCES ${metadataTableName}(metadata_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (api_id) REFERENCES ${apiTableName}(api_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createApiTypeTableQuery = `
  CREATE TABLE ${apiTypeTableName} (
    api_type_id INT AUTO_INCREMENT PRIMARY KEY,
    api_type_name VARCHAR(10),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    INDEX (api_type_name),
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createResponseFieldTableQuery = `
  CREATE TABLE ${responseFieldTableName} (
    field_list_id INT AUTO_INCREMENT PRIMARY KEY,
    api_id INT,
    header VARCHAR(30),
    source_fields VARCHAR(500),
    summary_formula VARCHAR(500),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (api_id) REFERENCES ${metaApiTableName}(api_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createDeviceMasterTableQuery = `
  CREATE TABLE ${deviceMasterTableName} (
    device_id UUID PRIMARY KEY,
    master_device_id UUID,
    device_type_id INT,
    metadata_id UUID,
    make VARCHAR(15),
    model VARCHAR(15),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (metadata_id) REFERENCES ${metadataTableName}(metadata_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (master_device_id),
    INDEX (device_type_id),
    INDEX (make),
    INDEX (model),
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;

const createApiTableQuery = `
  CREATE TABLE ${apiTableName} (
    api_id UUID PRIMARY KEY,
    api_type_id INT,
    endpointurl VARCHAR(500),
    header VARCHAR(500),
    body VARCHAR(500),
    body_encoding VARCHAR(10),
    response_type VARCHAR(100),
    create_date DATETIME,
    last_update_date DATETIME,
    create_by_userid UUID,
    last_update_userid UUID,
    delete_flag BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (api_type_id) REFERENCES ${apiTypeTableName}(api_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX (create_date),
    INDEX (last_update_date),
    INDEX (create_by_userid),
    INDEX (last_update_userid),
    INDEX (delete_flag)
  )
`;



// Create tables individually if they don't exist
createTableIfNotExists(companyTypeTableName, createCompanyTypeTableQuery)
  .then(() => createTableIfNotExists(companyMasterTableName, createCompanyMasterTableQuery))
  .then(() => createTableIfNotExists(plantMasterTableName, createPlantMasterTableQuery))
  .then(() => createTableIfNotExists(userTableName, createUserTableQuery))
  .then(() => createTableIfNotExists(plantUserTableName, createPlantUserTableQuery))
  .then(() => createTableIfNotExists(roleTableName, createRoleTableQuery))
  .then(() => createTableIfNotExists(userRoleTableName, createUserRoleTableQuery))
  .then(() => createTableIfNotExists(moduleTableName, createModuleTableQuery))
  .then(() => createTableIfNotExists(moduleRoleTableName, createModuleRoleTableQuery))
  .then(() => createTableIfNotExists(deviceTypeTableName, createDeviceTypeTableQuery))
  .then(() => createTableIfNotExists(targetFieldTableName, createTargetFieldTableQuery))
  .then(() => createTableIfNotExists(metadataTableName, createMetadataTableQuery))
  .then(() => createTableIfNotExists(metaApiTableName, createMetaApiTableQuery))
  .then(() => createTableIfNotExists(apiTypeTableName, createApiTypeTableQuery))
  .then(() => createTableIfNotExists(responseFieldTableName, createResponseFieldTableQuery))
  .then(() => createTableIfNotExists(deviceMasterTableName, createDeviceMasterTableQuery))
  .then(() => createTableIfNotExists(apiTableName, createApiTableQuery))












  .then(() => {
    console.log('All tables checked and created if not existing.');
    connection.end();
  })
  .catch(err => {
    console.error(err);
    connection.end();
  });

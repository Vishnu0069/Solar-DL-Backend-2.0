const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const config = require('./config'); // Make sure this path is correct
const collectionName= '/api/inverterDetail'; // Replace with your Collection Name

const getData = async (req, res) => {
  const contentMD5 = req.headers['content-md5'];
  const contentType = req.headers['content-type'];
  const dateHeader = req.headers['date'];
  const authorization = req.headers['authorization'];

  // Generate MD5 hash of the request body for comparison
  const expectedMD5 = crypto.createHash('md5').update(JSON.stringify(req.body)).digest('base64');

  // Validate Content-MD5 and Content-Type
  if (contentMD5 !== expectedMD5 || contentType !== 'application/json') {
    return res.status(400).send('Invalid MD-5 or content-type');
  }

  // Validate Date within a 15-minute window
  const requestDate = new Date(dateHeader);
  const currentDate = new Date();
  const timeDifference = Math.abs(currentDate - requestDate);
  if (timeDifference > 15 * 60 * 1000) {
    return res.status(400).send('Invalid Date');
  }

  // Validate Authorization header
  const stringToSign = `POST\n${contentMD5}\n${contentType}\n${dateHeader}\n/api/inverterDetail`;
  const hmac = crypto.createHmac('sha1', config.VALID_API_SECRET).update(stringToSign).digest('base64');
  const expectedAuthorization = `API ${config.VALID_API_ID}:${hmac}`;

  if (authorization !== expectedAuthorization) {
    return res.status(401).send('Wrong Sign');
  }

  // Connect to MongoDB and fetch data
  try {
    const client = new MongoClient(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();

    // Convert the data to JSON with custom replacer function to show nested objects
    const jsonData = JSON.stringify(data, (key, value) => {
      // If the value is an object, return its properties
      if (typeof value === 'object' && value !== null) {
        return Object.assign({}, value);
      }
      return value;
    }, 2); // 2 spaces for indentation

    // Send the modified JSON data as response
    res.json(jsonData);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  getData
};

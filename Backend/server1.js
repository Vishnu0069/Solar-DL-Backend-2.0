const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const app = express();
const port = 3000;

const VALID_API_ID = 'abcdef123456'; // Replace with your valid API ID
const VALID_API_SECRET = 'yourApiSecret'; // Replace with your valid API Secret

// MongoDB details
const mongoUri = 'mongodb+srv://Vishnu1232:Vishnu1232@source-simulation-solis.lpokxhv.mongodb.net/?retryWrites=true&w=majority&appName=Source-Simulation-Solis';

const dbName = 'Api'; // Replace with your Database Name
const collectionName = 'Demo'; // Replace with your Collection Name

app.use(bodyParser.json());

app.post('/api/data', async (req, res) => {
  const contentMD5 = req.headers['content-md5'];
  const contentType = req.headers['content-type'];
  const dateHeader = req.headers['date'];
  const authorization = req.headers['authorization'];

  // Calculate the expected MD5 hash for comparison
  const expectedMD5 = crypto.createHash('md5').update(JSON.stringify(req.body)).digest('base64');

  // Validate Content-MD5 and Content-Type
  if (contentMD5 !== expectedMD5 || contentType !== 'application/json;charset=UTF-8') {
    return res.status(400).send('Invalid headers');
  }

  // Validate Date within a 15-minute window
  const requestDate = new Date(dateHeader);
  const currentDate = new Date();
  const timeDifference = Math.abs(currentDate - requestDate);
  if (timeDifference > 15 * 60 * 1000) { // 15 minutes in milliseconds
    return res.status(400).send('Invalid Date');
  }

  // Validate Authorization header
  const stringToSign = `POST\n${contentMD5}\n${contentType}\n${dateHeader}\n/api/data`;
  const hmac = crypto.createHmac('sha1', VALID_API_SECRET).update(stringToSign).digest('base64');
  const expectedAuthorization = `API ${VALID_API_ID}:${hmac}`;

  if (authorization !== expectedAuthorization) {
    return res.status(401).send('Unauthorized');
  }

  // Connect to MongoDB and fetch data
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

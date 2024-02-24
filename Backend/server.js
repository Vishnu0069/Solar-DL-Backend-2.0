const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const hmacSHA1 = require('crypto-js/hmac-sha1');
const Base64 = require('crypto-js/enc-base64');

const app = express();
const port = 3000;

// Replace with your actual values
const API_SECRET = '2a9ea6b1f88f47f6a0362a51dbe65e6f'; // Your secret key for HMAC

// Predefined values for validation

const mongoUri = 'mongodb+srv://Vishnu1232:Vishnu1232@source-simulation-solis.lpokxhv.mongodb.net/?retryWrites=true&w=majority&appName=Source-Simulation-Solis';
const dbName = 'Api';
const collectionName = 'Demo';

app.use(bodyParser.json());

app.post('/api/data', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const dateHeader = req.headers['date'];
  const contentMD5 = req.headers['content-md5'];

  // Validate the Authorization header format
  if (!authorizationHeader.startsWith('API ')) {
    return res.status(401).send('Invalid Authorization Header');
  }
  
  const [authType, credentials] = authorizationHeader.split(' ');
  const [apiId, clientSignature] = credentials.split(':');

  // Construct the string to sign
  const method = req.method;
  const contentType = req.headers['content-type'];
  const resource = '/v1/api/inverterList'; // Your API endpoint
  const stringToSign = method + '\n' + contentMD5 + '\n' + contentType + '\n' + dateHeader + '\n' + resource;

  // Generate server-side HMAC signature
  const hmac = hmacSHA1(stringToSign, API_SECRET);
  const serverSignature = Base64.stringify(hmac);

  // Compare client and server signatures
  if (serverSignature !== clientSignature) {
    return res.status(401).send('Invalid Signature');
  }

  // Connect to MongoDB and fetch data
  try {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
    console.log(contentMD5);
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

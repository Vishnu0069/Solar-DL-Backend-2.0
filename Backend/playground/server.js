const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const hmacSHA1 = require('crypto-js/hmac-sha1');
const Base64 = require('crypto-js/enc-base64');

const app = express();
const port = 13333; // Port as per the SolisCloud API documentation

app.use(bodyParser.json());

app.post('/v1/api/inverterDetail', (req, res) => {
  const { headers, body } = req;

  // MD5 check
  const bodyMD5 = crypto.createHash('md5').update(JSON.stringify(body)).digest('base64');
  if (headers['content-md5'] !== bodyMD5) {
    return res.status(400).send('Invalid Content-MD5 header');
  }

  // Content-Type check
  if (headers['content-type'] !== 'application/json;charset=UTF-8') {
    return res.status(400).send('Invalid Content-Type header');
  }

  // Date check
  const dateReceived = new Date(headers['date']);
  const dateCurrent = new Date();
  const timeDifference = Math.abs(dateCurrent - dateReceived);
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  if (timeDifference > FIFTEEN_MINUTES) {
    return res.status(400).send('Invalid Date header');
  }

  // Authorization check
  const [authType, apiId, signature] = headers['authorization'].split(' ');
  if (authType !== 'API' || apiId !== 'yourApiId') {
    return res.status(400).send('Invalid Authorization header');
  }

  const secret = 'yourApiSecret'; // This should be secured
  const stringToSign = `POST\n${bodyMD5}\n${headers['content-type']}\n${headers['date']}\n/v1/api/inverterDetail`;
  const expectedSignature = Base64.stringify(hmacSHA1(stringToSign, secret));

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  // If all checks pass, proceed with your business logic
  res.json({ message: 'Authorized request' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

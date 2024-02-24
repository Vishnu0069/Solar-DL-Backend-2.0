const axios = require('axios');
const crypto = require('crypto');
const hmacSHA1 = require('crypto-js/hmac-sha1');
const Base64 = require('crypto-js/enc-base64');

const apiUrl = 'http://localhost:3000/api/data';
const apiKey = 'your_api_id'; // Replace with your actual API ID
const apiSecret = '2a9ea6b1f88f47f6a0362a51dbe65e6f'; // Your secret key for HMAC

const body = { pageNo: 1, pageSize: 10 }; // Your request body
const bodyJson = JSON.stringify(body);

// Generate MD5 hash of your body
const contentMD5 = crypto.createHash('md5').update(bodyJson).digest('base64');

// Generate date in required format
const date = 'Sat, 24 Feb 2024 04:50:59 GMT';

// Construct the string to sign
const method = 'POST';
const contentType = 'application/json';
const resource = '/v1/api/inverterList'; // Your API endpoint
const stringToSign = method + '\n' + contentMD5 + '\n' + contentType + '\n' + date + '\n' + resource;

// Generate HMAC signature
const hmac = hmacSHA1(stringToSign, apiSecret);
const signature = Base64.stringify(hmac);

// Make the request
axios.post(apiUrl, body, {
  headers: {
    'Content-Type': contentType,
    'Date': date,
    'Authorization': `API ${apiKey}:${signature}`,
    'Content-MD5': contentMD5
  }
})
.then(response => console.log(response.data))
.catch(error => {
  console.error('Error:', error.response ? error.response.data : error.message);
});

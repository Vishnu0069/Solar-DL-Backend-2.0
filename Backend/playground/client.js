const axios = require('axios');
const crypto = require('crypto');
const hmacSHA1 = require('crypto-js/hmac-sha1');
const Base64 = require('crypto-js/enc-base64');

const apiUrl = 'http://localhost:3000/api/data';
const apiId = 'abcdef123456';
const apiSecret = 'yourApiSecret';
const body = { "id": "1308675217944611083", "sn": "120B40198150131" };

// Generate MD5 of the body
const contentMD5 = crypto.createHash('md5').update(JSON.stringify(body)).digest('base64');

// Get GMT formatted date
const date = 'Wed, 28 Feb 2024 06:32:41 GMT';

// Generate signature
const stringToSign = `POST\n${contentMD5}\napplication/json;charset=UTF-8\n${date}\n/api/data`;
const signature = Base64.stringify(hmacSHA1(stringToSign, apiSecret));

// Make the request
axios.post(apiUrl, body, {
  headers: {
    'Content-MD5': contentMD5,
    'Content-Type': 'application/json;charset=UTF-8',
    'Date': date,
    'Authorization': `API ${apiId}:${signature}`
  }
})
.then(response => console.log(response.data,contentMD5,date,apiId,signature))
.catch(error => console.error('Error:', error.response.data));

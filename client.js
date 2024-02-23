const axios = require('axios');
const crypto = require('crypto');

const apiUrl = 'http://localhost:3000/api/data';
const apiKey = 'your_api_key';
const apiSignature = 'your_api_signature'; // This should be generated based on your specific requirements
const currentDate = 'Fri, 23 Feb 2024 12:43:01 GMT';

const body = { key: 'value' }; // Your request body
const bodyJson = JSON.stringify(body);

// Generate MD5 hash of your body
const contentMD5 = crypto.createHash('md5').update(bodyJson).digest('base64');

axios.post(apiUrl, body, {
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'X-API-Key': apiKey,
    'X-API-Signature': apiSignature,
    'Date': currentDate,
    'Content-MD5': contentMD5
  }
})
.then(response => console.log(response.data))
.catch(error => {
  console.error('Error:', error.response ? error.response.data : error.message);
});

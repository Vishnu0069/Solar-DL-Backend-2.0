const axios = require('axios');
const CryptoJS = require('crypto-js');

const API_URL = 'http://localhost:3000/api/data'; // Replace with your actual API URL
const API_ID = 'abcdef123456'; // Replace with your actual API ID
const API_SECRET = 'yourApiSecret'; // Replace with your actual API Secret

async function makeApiCall() {
  const body = JSON.stringify({ "body":"demo" });
  const contentMD5 = CryptoJS.MD5(body).toString(CryptoJS.enc.Base64);
  const contentType = 'application/json;charset=UTF-8';
  const date = new Date().toUTCString();

  const stringToSign = `POST\n${contentMD5}\n${contentType}\n${date}\n/api/data`;
  const hmac = CryptoJS.HmacSHA1(stringToSign, API_SECRET).toString(CryptoJS.enc.Base64);
  const authorization = `API ${API_ID}:${hmac}`;

  const headers = {
    'Content-MD5': contentMD5,
    'Content-Type': contentType,
    'Date': date,
    'Authorization': authorization,
  };

  try {
    const response = await axios.post(API_URL, body, { headers: headers });
    console.log('Data received:', response.data);
  } catch (error) {
    console.error('Error making API call:', error.message);
  }
}

makeApiCall();

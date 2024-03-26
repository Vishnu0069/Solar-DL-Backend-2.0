// Start of code block

// Import Express framework and create an Express application
// Written by Vishnu Prasad S
const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
// Written by Vishnu Prasad S
app.use(express.json());

// Define a POST route for /api/submitData
// Written by Vishnu Prasad S
app.post('/api/submitData', (req, res) => {
  
  // Initialize an empty string for the constructed URL
  // Written by Vishnu Prasad S
  let constructedUrl = '';

  // Switch based on the DeviceMake field in the request body, converted to lower case
  // Written by Vishnu Prasad S
  switch (req.body.DeviceMake.toLowerCase()) {
    // Case for 'solaredge' devices
    // Written by Vishnu Prasad S
    case 'solaredge':
            // Construct URL for SolarEdge devices including start and end times
            // Written by Vishnu Prasad S
            const today = new Date().toISOString().split('T')[0]; // Gets today's date in YYYY-MM-DD format
            const startTime = req.body.requestTime + ':00'; // Appends :00 to received time for seconds
            const formattedStartTime = `${today}%20${startTime}`; // Formats start time with %20 for space

            // Calculates and formats end time by adding 15 minutes to the start time
            // Written by Vishnu Prasad S
            const requestTimeDate = new Date(`${today}T${req.body.requestTime}:00`);
            requestTimeDate.setMinutes(requestTimeDate.getMinutes() + 15);
            let endTime = `${requestTimeDate.getHours().toString().padStart(2, '0')}:${requestTimeDate.getMinutes().toString().padStart(2, '0')}:00`;
            const formattedEndTime = `${today}%20${endTime}`;

            // Constructs the full URL with API key
            // Written by Vishnu Prasad S
            constructedUrl = `${req.body.EndpointApi1}/${req.body.ModelNo}/${req.body.DeviceSerialNumber}/data?startTime=${formattedStartTime}&endTime=${formattedEndTime}&api_key=${req.body.API_Key}`;
            break;
    // Case for 'solis' devices
    // Written by Vishnu Prasad S
    case 'solis': {
      // Updated case for 'solis' devices to construct headers and body for the API request
      const apiId = req.body.API_Key;
      const contentMd5 = JSON.parse(req.body.HeaderforApi1)["Content-MD5"];
      const contentType = 'application/json';
      const date = new Date().toUTCString(); // Current date and time in GMT format
      const requestBody = JSON.parse(req.body.Api1Body);
      
      // Assuming this is the endpoint for the request
      const apiEndpoint = '/v1/api/userStationList'; 
    
      // Concatenate parts to form the string to sign
      const stringToSign = `POST\n${contentMd5}\n${contentType}\n${date}\n${apiEndpoint}`;
    
      // Secret key for HMAC
      const secretKey = '2a9ea6b1f88f47f6a0362a51dbe65e6f';
    
      // Create HMAC signature
      const signature = crypto.createHmac('sha1', secretKey).update(stringToSign).digest('base64');
    
      // Construct the full URL with API key
      constructedUrl = `${req.body.EndpointApi1}?api_key=${apiId}`;
    
      console.log('Constructed URL for Solis:', constructedUrl);
      console.log('Content-MD5:', contentMd5);
      console.log('Content-Type:', contentType);
      console.log('Date:', date);
      console.log('Signature:', signature);
      console.log('Request Body:', requestBody);
      // Note: In a real application, you would use these values (headers and body)
      // to make the API request to the Solis service.
      break;
    }
  
  

      
      
    // Case for 'solarman' devices, assuming similar URL construction for demonstration
    // Written by Vishnu Prasad S
    case 'solarman':
      constructedUrl = `${req.body.EndpointApi1}?api_key=${req.body.API_Key}`;
      break;
    // Default case if the DeviceMake is not recognized
    // Written by Vishnu Prasad S
    default:
      console.log(`DeviceMake ${req.body.DeviceMake} not recognized. No URL constructed.`);
      break;
  }

  // Construct response data including the constructed URL
  // Written by Vishnu Prasad S
  const responseData = {
    ...req.body,
    constructedUrl: constructedUrl ? constructedUrl : 'Not applicable'
  };

  // Log the response data including the URL
  // Written by Vishnu Prasad S
  console.log('Data with constructed URL:', responseData);

  // Respond with a success status code
  // Written by Vishnu Prasad S
  res.status(200).send('Data received successfully');
});

// Start the Express server
// Written by Vishnu Prasad S
app.listen(port, () => {
  console.log(`mon2 service listening at http://localhost:${port}`);
});

// End of code block

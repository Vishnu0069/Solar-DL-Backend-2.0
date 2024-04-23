/*import React, { useState } from 'react';

function GetPlantDetails() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [integratorID, setIntegratorID] = useState('');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState(null);

  const handleFetchDetails = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/GetPlantDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          passwordhashcode: password,
          IntegratorID: integratorID
        })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();  // This line throws if the response is not valid JSON
      setDetails(data.Plants);
      setMessage('Plant details retrieved successfully!');
    } catch (error) {
      console.error('Error fetching plant details:', error);
      setMessage(`Failed to fetch plant details: ${error.message}`);
    }
  };
  

  return (
    <div>
      <h2>Get Plant Details</h2>
      <form onSubmit={handleFetchDetails}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Integrator ID</label>
          <input
            type="text"
            value={integratorID}
            onChange={(e) => setIntegratorID(e.target.value)}
            required
          />
        </div>
        <button type="submit">Fetch Details</button>
      </form>
      <div>{message}</div>
      {details && (
        <div>
          <h3>Plants:</h3>
          <ul>
            {details.map((plant, index) => (
              <li key={index}>
                <strong>{plant.PlantName}</strong> ({plant.PlantType})
                <ul>
                  <li>System Type: {plant.SystemType}</li>
                  <li>Capacity: {plant.Capacity}</li>
                  <li>Owner: {plant.Owner_FirstName} {plant.Owner_LastName}</li>
                  <li>Email: {plant.Owner_EmailID}</li>
                  <li>Mobile: {plant.Owner_Mobile}</li>
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GetPlantDetails;

import React, { useState } from 'react';
import axios from 'axios';

function GetPlantDetails() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [integratorID, setIntegratorID] = useState('');
  const [plants, setPlants] = useState([]);
  const [message, setMessage] = useState('');

  const handleFetchDetails = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page on submit
    try {
      const response = await axios.post('http://localhost:3001/GetPlantDetails', {
        email,
        passwordhashcode: password,
        IntegratorID: integratorID
      });

      if (response.status === 200) {
        setPlants(response.data.Plants); // Assuming the data format is as expected
        setMessage('Plant details retrieved successfully!');
      } else {
        setMessage('Failed to fetch plant details');
        setPlants([]);
      }
    } catch (error) {
      console.error('Error fetching plant details:', error);
      setMessage('Failed to fetch plant details: ' + error.response?.data || error.message);
      setPlants([]);
    }
  };

  return (
    <div>
      <h2>Get Plant Details</h2>
      <form onSubmit={handleFetchDetails}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Integrator ID</label>
          <input type="text" value={integratorID} onChange={(e) => setIntegratorID(e.target.value)} required />
        </div>
        <button type="submit">Fetch Details</button>
      </form>
      <div>{message}</div>
      {plants.length > 0 && (
        <ul>
          {plants.map((plant, index) => (
            <li key={index}>
              <strong>{plant.PlantName}</strong> ({plant.PlantType})
              <div>System Type: {plant.SystemType}</div>
              <div>Capacity: {plant.Capacity}</div>
              <div>Owner: {plant.Owner_FirstName} {plant.Owner_LastName}</div>
              <div>Email: {plant.Owner_EmailID}</div>
              <div>Mobile: {plant.Owner_Mobile}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GetPlantDetails;*/

import React, { useState } from 'react';

function GetPlantDetails() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [integratorID, setIntegratorID] = useState('');
  const [plants, setPlants] = useState([]);
  const [error, setError] = useState('');

  const handleFetchDetails = async (e) => {
    e.preventDefault(); // Prevent the default form submit behavior
    setError(''); // Clear previous errors

    try {
      const response = await fetch('https://8zcpxm9b-3001.inc1.devtunnels.ms/GetPlantDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          passwordhashcode: password,
          IntegratorID: integratorID
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.Plants && data.Plants.length > 0) {
        setPlants(data.Plants);
      } else {
        setError('No plant details found.');
      }
    } catch (err) {
      setError('Failed to fetch plant details. ' + err.message);
    }
  };

  return (
    <div>
      <h1>Get Plant Details</h1>
      <form onSubmit={handleFetchDetails}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Integrator ID:</label>
          <input
            type="text"
            value={integratorID}
            onChange={(e) => setIntegratorID(e.target.value)}
            required
          />
        </div>
        <button type="submit">Fetch Details</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {plants.length > 0 && (
        <div>
          <h3>Plants:</h3>
          <ul>
            {plants.map((plant, index) => (
              <li key={index}>
                <h2>{plant.PlantName}</h2>
                <p>Plant ID: {plant.plantid}</p> {/* Displaying plantID */}
                <p>Type: {plant.PlantType}</p>
                <p>System Type: {plant.SystemType}</p>
                <p>Capacity: {plant.Capacity}{plant.CapacityUOM}</p>
                <p>Serial Number: {plant.PlantSerialNo}</p>
                <p>Azimuthal Angle: {plant.AzimuthalAngle} degrees</p>
                <p>Inclination Angle: {plant.InclinationAngle} degrees</p>
                <p>Owner: {plant.Owner_FirstName} {plant.Owner_LastName}</p>
                <p>Email: {plant.Owner_EmailID}</p>
                <p>Mobile: {plant.Owner_Mobile}</p>
                <p>Address: {plant.AddressLine1}, {plant.AddressLine2}</p>
                <p>{plant.District}, {plant.State}, {plant.Country} - {plant.Pincode}</p>
                <p>Coordinates: {plant.Latitude}, {plant.Longitude}</p>
                <p>Creation Date: {plant.CreationDate}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GetPlantDetails;


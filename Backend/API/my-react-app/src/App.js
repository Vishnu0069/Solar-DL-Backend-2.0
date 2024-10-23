import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './Login'; // Ensure this import path is correct
import GetPlantDetails from './GetPlantDetails'; // Ensure this import path is correct
import TotalPlantsForm from './TotalPlantsForm';
import PlantCountForm from './PlantCountForm';  // Adjust path as necessary
import TotalCapacityForm from './TotalCapacityForm';


function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Login</Link>
            </li>
            <li>
              <Link to="/get-plant-details">Get Plant Details</Link>
            </li>
            
            <li>
              <Link to="/Total-installations">Total Installations</Link>  {/* Add a link to the new installations form */}
            </li>
            <li>
            <Link to="/plant-count">Plant count</Link>  {/* Add a link to the new installations form */}
            </li>
            <li>
            <Link to="/sum-capacity">SUm capacity</Link>  {/* Add a link to the new installations form */}
            </li>
          </ul>
        </nav>

        {/* Routes component replaces Switch in React Router v6 */}
        <Routes>
          <Route path="/sum-capacity" element={<TotalCapacityForm />} />
          <Route path="/plant-count" element={<PlantCountForm />} />
          <Route path="/Total-installations" element={<TotalPlantsForm />} />
          <Route path="/get-plant-details" element={<GetPlantDetails />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

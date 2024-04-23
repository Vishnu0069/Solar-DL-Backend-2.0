import React, { useState } from 'react';

function PlantCountForm() {
    const [IntegratorID, setIntegratorID] = useState('');
    const [plantCount, setPlantCount] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const response = await fetch('https://8zcpxm9b-3001.inc1.devtunnels.ms/plantCount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ IntegratorID })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch plant count');
            }
            setPlantCount(data.PlantCount);
        } catch (error) {
            setError('Error: ' + error.message);
        }
    };

    return (
        <div>
            <h1>Get Plant Count</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={IntegratorID}
                    onChange={(e) => setIntegratorID(e.target.value)}
                    placeholder="Enter Integrator ID"
                    required
                />
                <button type="submit">Submit</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {plantCount !== null && <p>Total Plants: {plantCount}</p>}
        </div>
    );
}

export default PlantCountForm;

import React, { useState } from 'react';

function PlantCountForm() {
    const [IntegratorID, setIntegratorID] = useState('');
    const [plantCount, setPlantCount] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('https://8zcpxm9b-3001.inc1.devtunnels.ms/plantCount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ IntegratorID })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            setPlantCount(data.TotalPlants);
        } catch (error) {
            setError('Failed to fetch plant count: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Fetch Plant Count</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Integrator ID:</label>
                    <input
                        type="text"
                        value={IntegratorID}
                        onChange={e => setIntegratorID(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    Get Plant Count
                </button>
            </form>
            {isLoading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {plantCount !== null && (
                <p>Total Plants: {plantCount}</p>
            )}
        </div>
    );
}

export default PlantCountForm;

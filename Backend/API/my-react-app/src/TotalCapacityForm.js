import React, { useState } from 'react';

function TotalCapacityForm() {
    const [IntegratorID, setIntegratorID] = useState('');
    const [totalCapacity, setTotalCapacity] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('https://8zcpxm9b-3001.inc1.devtunnels.ms/totalCapacity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ IntegratorID })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch total capacity');
            }
            setTotalCapacity(data.TotalCapacity);
        } catch (error) {
            setError('Error: ' + error.message);
        }
    };

    return (
        <div>
            <h1>Fetch Total Capacity</h1>
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
                <button type="submit">Submit</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {totalCapacity !== null && (
                <p>Total Capacity: {totalCapacity}</p>
            )}
        </div>
    );
}

export default TotalCapacityForm;

import React, { useState } from 'react';

function NewInstallationsForm() {
    const [formData, setFormData] = useState({
        IntegratorID: '',
        FromDate: '',
        ToDate: ''
    });
    const [installationsCount, setInstallationsCount] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch('https://8zcpxm9b-3001.inc1.devtunnels.ms/GetNewInstallations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch the count of new installations.');
            }
            setInstallationsCount(data.NewInstallations);
        } catch (error) {
            setError('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Fetch New Installations Count</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Integrator ID:</label>
                    <input
                        type="text"
                        name="IntegratorID"
                        value={formData.IntegratorID}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>From Date:</label>
                    <input
                        type="datetime-local"
                        name="FromDate"
                        value={formData.FromDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>To Date:</label>
                    <input
                        type="datetime-local"
                        name="ToDate"
                        value={formData.ToDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>Get Count</button>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {installationsCount !== null && (
                <p>Total New Installations: {installationsCount}</p>
            )}
        </div>
    );
}

export default NewInstallationsForm;

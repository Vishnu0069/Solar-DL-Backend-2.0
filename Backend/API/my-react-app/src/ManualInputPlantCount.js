import React, { useState } from 'react';

function ManualInputPlantCount() {
    const [formData, setFormData] = useState({
        user_email: '',
        passwordhashcode: '',
        IntegratorID: ''
    });
    const [count, setCount] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://8zcpxm9b-3001.inc1.devtunnels.ms/getPlantInstallationCount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch plant count');
            }
            setCount(data.count);
        } catch (err) {
            setError('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Enter Plant Installation Query Data</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    User Email:
                    <input type="email" name="user_email" value={formData.user_email} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Password Hashcode:
                    <input type="password" name="passwordhashcode" value={formData.passwordhashcode} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Integrator ID:
                    <input type="text" name="IntegratorID" value={formData.IntegratorID} onChange={handleChange} required />
                </label>
                <br />
                <button type="submit" disabled={loading}>Get Plant Count</button>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {count !== null && <p>Total Plants Installed: {count}</p>}
        </div>
    );
}

export default ManualInputPlantCount;

const express = require('express');
const pool = require('../../db');  // Database connection
const router = express.Router();

router.post('/categories', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT category_name FROM category');
        res.status(200).json(categories.map(category => category.category_name));
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

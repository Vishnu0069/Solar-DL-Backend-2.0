// const express = require('express');
// const pool = require('../../db');  // Database connection
// const router = express.Router();

// router.post('/categories', async (req, res) => {
//     try {
//         const [categories] = await pool.query('SELECT category_name FROM category');
//         res.status(200).json(categories.map(category => category.category_name));
//     } catch (error) {
//         console.error('Error fetching categories:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// module.exports = router;
const express = require("express");
const pool = require("../../db"); // Database connection
const router = express.Router();
const auth = require("../../middleware/auth");

router.get("/categories", auth, async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    // Step 1: Fetch the country associated with the entityid from EntityMaster
    const [entityRows] = await pool.query(
      `
            SELECT country 
            FROM EntityMaster 
            WHERE LOWER(entityid) = LOWER(?)
        `,
      [entityid]
    );

    if (entityRows.length === 0) {
      return res.status(404).json({ message: "Entity not found" });
    }

    const country = entityRows[0].country;

    // Step 2: Fetch categories from Entity_category based on the fetched country
    const [categories] = await pool.query(
      `
            SELECT category_name 
            FROM Entity_category 
            WHERE LOWER(country) = LOWER(?)
        `,
      [country]
    );

    res
      .status(200)
      .json({
        categories: categories.map((category) => category.category_name),
      });
  } catch (error) {
    console.error("Error fetching entity categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

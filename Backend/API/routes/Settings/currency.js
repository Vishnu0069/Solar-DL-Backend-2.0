const express = require("express");
const router = express.Router();
const connection = require("../../db/index"); // Assuming you're using mysql2 or promise wrapper

router.get("/", async (req, res) => {
  try {
    const [currency] = await connection.query("SELECT * FROM currencies");
    console.log(currency);
    const currencyOptions = currency.map(
      (row) => `${row.currency_code} - ${row.currency_name}`
    );

    res.status(200).json(currencyOptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error_message: error.message });
  }
});

module.exports = router;

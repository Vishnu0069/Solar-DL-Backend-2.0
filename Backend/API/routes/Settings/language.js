const express = require("express");
const router = express.Router();
const connection = require("../../db/index");

router.get("/", async (req, res) => {
  try {
    const [languages] = await connection.query("SELECT * FROM languages");

    const result = languages.map((row) => `${row.name}`);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.json({ error_message: message.error });
  }
});

module.exports = router;

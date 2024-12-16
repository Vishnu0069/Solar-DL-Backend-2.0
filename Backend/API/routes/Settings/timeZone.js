const express = require("express");
const router = express.Router();
const connection = require("../../db/index");

router.get("/", async (req, res) => {
  try {
    const [timeZone] = await connection.query("SELECT * FROM timezones");
    const result = timeZone.map((res) => `${res.timezone_name}`);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.json({ error_message: message.error });
  }
});

module.exports = router;

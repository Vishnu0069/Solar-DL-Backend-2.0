const express = require("express");
const router = express.Router();
const connection = require("../../db/index");

router.get("/", async (req, res) => {
  try {
    await connection.query("SELECT * FROM timezones");

    res.status(200).json({ message: "Working" });
  } catch (error) {
    console.error(error);
    res.json({ error_message: message.error });
  }
});

module.exports = router;

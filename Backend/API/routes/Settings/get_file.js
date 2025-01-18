const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const connection = require("../../db/index");
const auth = require("../../middleware/auth");

// API to fetch the file for a given entity_id and make
router.get("/fetch-file", auth, async (req, res) => {
  const { entity_id, make } = req.query;

  // Validate request parameters
  if (!entity_id || !make) {
    return res.status(400).json({
      error_message: "Please provide entity_id and make.",
    });
  }

  try {
    // Query the database to get the file path
    const query = `
      SELECT file_path
      FROM error_log_files
      WHERE entity_id = ? AND make = ?
    `;
    const [rows] = await connection.query(query, [entity_id, make]);

    if (rows.length === 0) {
      return res.status(404).json({
        error_message: `No file found for entity_id: ${entity_id} and make: ${make}`,
      });
    }

    // Get the file path from the database
    const filePath = rows[0].file_path;

    // Verify if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error_message: "The file does not exist on the server.",
      });
    }

    // Send the file to the client
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({
          error_message: "An error occurred while sending the file.",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error_message: "An error occurred while fetching the file.",
    });
  }
});

module.exports = router;

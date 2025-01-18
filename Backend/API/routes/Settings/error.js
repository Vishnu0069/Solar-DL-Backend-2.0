// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const router = express.Router();
// const connection = require("../../db/index");
// const auth = require("../../middleware/auth");

// // Define storage for multer
// const uploadFolder = path.join(__dirname, "../../ErrorLogs");
// if (!fs.existsSync(uploadFolder)) {
//   fs.mkdirSync(uploadFolder); // Create the folder if it doesn't exist
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadFolder);
//   },
//   filename: (req, file, cb) => {
//     const { entity_id, make } = req.body;
//     const ext = path.extname(file.originalname);
//     cb(null, `${entity_id}-${make}-${Date.now()}${ext}`);
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const fileTypes = /xls|csv/;
//     const extname = fileTypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = fileTypes.test(file.mimetype);
//     if (extname && mimetype) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only .xls and .csv files are allowed!"));
//     }
//   },
// });

// router.post("/upload", auth, upload.single("file"), async (req, res) => {
//   const { entity_id, make } = req.body;

//   // Validate request body
//   if (!entity_id || !make) {
//     return res.status(400).json({
//       error_message: "Please provide entity_id and make.",
//     });
//   }

//   try {
//     // Store file information in the database
//     const filePath = `/ErrorLogs/${req.file.filename}`;
//     const query = `
//       INSERT INTO error_log_files (entity_id, make, file_path)
//       VALUES (?, ?, ?)
//     `;

//     await connection.query(query, [entity_id, make, filePath]);

//     res.status(200).json({
//       message: "File uploaded and logged successfully.",
//       file_path: filePath,
//     });
//   } catch (error) {
//     console.error(error);

//     // Delete file if database operation fails
//     fs.unlinkSync(req.file.path);

//     res.status(500).json({
//       error_message: "An error occurred while saving file information.",
//     });
//   }
// });

// module.exports = router;
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const connection = require("../../db/index");
const auth = require("../../middleware/auth");

// Define the folder path outside the repository
const uploadFolder = "/var/www/ErrorLogs";

// Ensure the folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true }); // Create the folder if it doesn't exist
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder); // Use the external folder path
  },
  filename: (req, file, cb) => {
    const { entity_id, make } = req.body;
    const ext = path.extname(file.originalname); // Get file extension
    const timestamp = Date.now();
    cb(null, `${entity_id}-${make}-${timestamp}${ext}`); // Filename format: entity_id-make-timestamp.extension
  },
});

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /xls|csv/; // Allowed file types
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only .xls and .csv files are allowed!")); // Reject invalid file types
    }
  },
});

// API to upload and save error log files
router.post("/upload-log", auth, upload.single("file"), async (req, res) => {
  const { entity_id, make } = req.body;

  // Validate request body
  if (!entity_id || !make || !req.file) {
    return res.status(400).json({
      error_message: "Please provide entity_id, make, and a valid file.",
    });
  }

  try {
    // Build the absolute file path
    const filePath = `/ErrorLogs/${req.file.filename}`;

    // Insert file details into the database
    const query = `
      INSERT INTO error_log_files (entity_id, make, file_path)
      VALUES (?, ?, ?)
    `;

    await connection.query(query, [entity_id, make, filePath]);

    res.status(200).json({
      message: "File uploaded and logged successfully.",
      file_path: filePath,
    });
  } catch (error) {
    console.error(error);

    // Delete the uploaded file if the database operation fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error_message: "An error occurred while saving file information.",
    });
  }
});

module.exports = router;

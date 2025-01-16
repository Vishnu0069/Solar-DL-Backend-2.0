const express = require("express");
const pool = require("../../../db"); // MySQL database connection pool
const { MongoClient } = require("mongodb"); // MongoDB client
require("dotenv").config();
const auth = require("../../../middleware/auth");

const router = express.Router();

// MongoDB URI and collection configuration
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB_NAME;
const mongoCollectionName = process.env.MONGODB_PLANT;

router.post("/getPlantPeakPower", auth, async (req, res) => {
  const { user_id } = req.body;

  // Validate input
  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  let mysqlConnection;
  let mongoClient;

  try {
    // Step 1: Retrieve plant IDs from MySQL
    mysqlConnection = await pool.getConnection();
    const [plantRows] = await mysqlConnection.query(
      "SELECT plant_id FROM Gsai_PlantUser WHERE user_id = ?",
      [user_id]
    );

    const plantIds = plantRows.map((row) => row.plant_id);
    if (plantIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No plants found for this user." });
    }

    // Step 2: Query MongoDB for the plant details
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const db = mongoClient.db(mongoDbName);
    const collection = db.collection(mongoCollectionName);

    // Find plant documents for the retrieved plant IDs
    const plantDocuments = await collection
      .find({ plant_id: { $in: plantIds } })
      .toArray();

    // Step 3: Calculate the sum of peak power
    const totalPeakPower = plantDocuments.reduce(
      (sum, plant) => sum + (plant.peak_power || 0),
      0
    );

    // Return the total peak power and plant details
    res.status(200).json({
      totalPeakPower,
      plantDocuments,
    });
  } catch (error) {
    console.error("Error fetching plant peak power:", error);
    res.status(500).json({
      message: "Error fetching plant peak power",
      error: error.message,
    });
  } finally {
    if (mysqlConnection) mysqlConnection.release();
    if (mongoClient) await mongoClient.close();
  }
});

module.exports = router;

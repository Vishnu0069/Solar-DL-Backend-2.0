const express = require("express");
const pool = require("../../../db"); // MySQL database connection
const { MongoClient } = require("mongodb"); // MongoDB client
require("dotenv").config();
const auth = require("../../../middleware/auth");

const router = express.Router();

const mongoUri = process.env.MONGODB_URI; // MongoDB URI
const mongoDbName = process.env.MONGODB_DB_NAME; // MongoDB database name
const mongoCollectionName = process.env.MONGODB_PLANT; // MongoDB collection name

router.post("/monthlySummary", auth, async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required." });
  }

  let mysqlConnection;
  let mongoClient;

  try {
    // Calculate the current month’s start and end date
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-based month index
    const startDateString = `${String(year)}-${String(month + 1).padStart(
      2,
      "0"
    )}-01`;
    const endDateString = now.toISOString().split("T")[0];

    console.log("Start Date:", startDateString);
    console.log("End Date:", endDateString);

    // Fetch plant IDs for the given user from MySQL
    mysqlConnection = await pool.getConnection();
    const [plantRows] = await mysqlConnection.query(
      "SELECT plant_id FROM Gsai_PlantUser WHERE user_id = ?",
      [user_id]
    );

    const plantIds = plantRows.map((row) => row.plant_id);
    console.log("Plant IDs fetched from MySQL:", plantIds);

    if (plantIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No plants found for this user." });
    }

    // Connect to MongoDB and query data
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const db = mongoClient.db(mongoDbName);
    const collection = db.collection(mongoCollectionName);

    console.log("MongoDB Collection Name:", mongoCollectionName);

    // MongoDB aggregation query to handle date format dynamically
    const plantDocuments = await collection
      .aggregate([
        {
          $match: {
            plant_id: { $in: plantIds.map((id) => new RegExp(`^${id}$`, "i")) },
          },
        },
        {
          $addFields: {
            isoDate: {
              $dateFromString: {
                dateString: "$Date",
                format: "%d-%b-%Y",
              },
            },
          },
        },
        {
          $match: {
            isoDate: {
              $gte: new Date(startDateString),
              $lte: new Date(endDateString),
            },
          },
        },
        {
          $group: {
            _id: { plant_id: "$plant_id", date: "$isoDate" },
            totalOutputEnergy: { $sum: "$ac_output" },
            onlineStatus: { $max: "$online_status" },
            type: { $first: "$plant_type" },
            category: { $first: "$category" },
            district: { $first: "$district" },
          },
        },
        {
          $sort: { "_id.date": 1 }, // Sort by date
        },
      ])
      .toArray();

    console.log("MongoDB Aggregated Documents:", plantDocuments);

    // Format the response
    const summary = plantDocuments.map((doc) => ({
      plant_id: doc._id.plant_id,
      date: doc._id.date,
      totalOutputEnergy: doc.totalOutputEnergy || 0,
      online_status: doc.onlineStatus || 0,
      type: doc.type || "Unknown",
      category: doc.category || "Unknown",
      district: doc.district || "Unknown",
    }));

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    res.status(500).json({
      message: "Error fetching monthly summary",
      error: error.message,
    });
  } finally {
    if (mysqlConnection) mysqlConnection.release();
    if (mongoClient) await mongoClient.close();
  }
});

module.exports = router;

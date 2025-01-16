const express = require("express");
const pool = require("../../../db"); // MySQL database connection
const { MongoClient } = require("mongodb"); // MongoDB client
require("dotenv").config();
const auth = require("../../../middleware/auth");

const router = express.Router();

const mongoUri = process.env.MONGODB_URI; // MongoDB URI
const mongoDbName = process.env.MONGODB_DB_NAME; // MongoDB database name
const mongoCollectionName = process.env.MONGODB_PLANT; // MongoDB collection name

// API to fetch plant dashboard details for a given user
router.get("/table", auth, async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required." });
  }

  let mysqlConnection;
  let mongoClient;

  try {
    // Connect to MySQL to fetch plant IDs for the given user
    mysqlConnection = await pool.getConnection();
    const [plantRows] = await mysqlConnection.query(
      "SELECT plant_id FROM Gsai_PlantUser WHERE user_id = ?",
      [user_id]
    );

    const plantIds = plantRows.map((row) => row.plant_id);

    if (plantIds.length === 0) {
      mysqlConnection.release();
      return res
        .status(404)
        .json({ message: "No plants found for the given user." });
    }

    console.log("Plant IDs fetched from MySQL:", plantIds);

    // Connect to MongoDB to fetch detailed plant information
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const db = mongoClient.db(mongoDbName);
    const collection = db.collection(mongoCollectionName);

    // Fetch unique plant details for the retrieved plant IDs
    const plantDetails = await collection
      .aggregate([
        {
          $match: {
            plant_id: { $in: plantIds.map((id) => new RegExp(`^${id}$`, "i")) },
          },
        },
        {
          $sort: {
            System_Date_Time: -1, // Sort by System_Date_Time (latest first)
          },
        },
        {
          $group: {
            _id: "$plant_id",
            entity_id: { $first: "$Entity_id" },
            plant_name: { $first: "$plant_name" },
            plant_capacity: { $first: "$capacity" },
            plant_installation_date: { $first: "$installation_date" },
            plant_make: { $first: "$make" },
            alerts: { $first: "$alerts" },
            plant_status: { $first: "$status" },
            country: { $first: "$country" },
            state: { $first: "$state" },
            district: { $first: "$district" },
            type: { $first: "$plant_type" },
            category: { $first: "$category" },
            peak_power: { $first: "$peak_power" },
            cuf: { $first: "$cuf" },
            pr: { $first: "$pr" },
            yield: { $first: "$yield" },
            rec_count: { $first: "$rec" },
            disabled: { $first: "$disabled" },
            selected: { $first: "$selected" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort the grouped results by plant_id
        },
      ])
      .toArray();

    // console.log("Unique Plant Details fetched from MongoDB:", plantDetails);

    if (plantDetails.length === 0) {
      return res.status(404).json({
        message: "No plant details found in MongoDB for the given user.",
      });
    }

    // Format the response
    const formattedDetails = plantDetails.map((plant) => ({
      plant_id: plant._id,
      entity_id: plant.entity_id || "Unknown",
      plant_name: plant.plant_name || "Unknown",
      plant_capacity: plant.plant_capacity || 0,
      plant_installation_date: plant.plant_installation_date || "Unknown",
      plant_make: plant.plant_make || "Unknown",
      alerts: plant.alerts || 0,
      plant_status: plant.plant_status || "Unknown",
      country: plant.country || "Unknown",
      state: plant.state || "Unknown",
      district: plant.district || "Unknown",
      type: plant.type || "Unknown",
      category: plant.category || "Unknown",
      peak_power: plant.peak_power || 0,
      cuf: plant.cuf || 0,
      pr: plant.pr || 0,
      yield: plant.yield || 0,
      rec_count: plant.rec_count || 0,
      disabled: plant.disabled || "f",
      selected: plant.selected || "f",
    }));

    res.status(200).json({
      //message: "Unique plant dashboard details retrieved successfully.",
      data: formattedDetails,
    });
  } catch (error) {
    console.error("Error fetching plant dashboard details:", error);
    res.status(500).json({
      message: "Error fetching plant dashboard details",
      error: error.message,
    });
  } finally {
    if (mysqlConnection) mysqlConnection.release();
    if (mongoClient) await mongoClient.close();
  }
});

module.exports = router;

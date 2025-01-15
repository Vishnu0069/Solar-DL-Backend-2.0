// const MongoClient = require("mongodb").MongoClient;
// const moment = require("moment");
// require("dotenv").config();

// const uri = process.env.MONGODB_URI; // MongoDB connection string
// const dbName = process.env.MONGODB_DB_NAME; // Database name
// const rawCollection = process.env.MONGODB_RAW_DATA_COLLECTION_NAME; // Raw data collection
// const summaryCollection = process.env.MONGODB_DAILY_SUMMARY; // Summary collection

// (async () => {
//   const client = new MongoClient(uri);

//   try {
//     await client.connect();
//     console.log("Connected to MongoDB");

//     const db = client.db(dbName);
//     const rawData = db.collection(rawCollection);
//     const dailySummary = db.collection(summaryCollection);

//     // Get the current date in UTC
//     const currentDate = moment().format("YYYY-MM-DD");

//     // Fetch all unique plant IDs based on LocalDateTime
//     const plantRecords = await rawData
//       .find({
//         "DeviceUUIDMap.LocalDateTime": { $regex: `^${currentDate}` },
//       })
//       .toArray();

//     // Group records by plant ID
//     const plantGroups = plantRecords.reduce((acc, record) => {
//       const plantId =
//         record.DeviceUUIDMap.HeaderTarget.plant_id || "VISHNU-123";

//       if (!acc[plantId]) {
//         acc[plantId] = [];
//       }
//       acc[plantId].push(record);
//       return acc;
//     }, {});

//     for (const [plantId, records] of Object.entries(plantGroups)) {
//       const firstRecord = records[0].DeviceUUIDMap.HeaderTarget;

//       // Initialize plant summary
//       const plantSummary = {
//         Entity_id: firstRecord.entityid || "UNKNOWN_ENTITY",
//         plant_id: plantId,
//         Time_zone: "+5:30 GMT",
//         Date: moment().format("DD-MMM-YYYY"),
//         System_Date_Time: new Date().toISOString(),
//         plant_name: firstRecord.plant_name || "Unknown Plant",
//         capacity: parseFloat(firstRecord.capacity || 0),
//         plant_type: firstRecord.plant_category || "Unknown",
//         country: firstRecord.country || "India",
//         region: firstRecord.region || "N/A",
//         state: firstRecord.state || "N/A",
//         district: firstRecord.district || "N/A",
//         dc_output: 0,
//         dc_uom: "kWh",
//         ac_output: 0,
//         ac_uom: "kWh",
//         devices: [],
//       };

//       let totalACOutput = 0;
//       let totalDCOutput = 0;

//       for (const record of records) {
//         const deviceData = record.DeviceUUIDMap;

//         // Compute device summary
//         const deviceSummary = {
//           device_id: deviceData.DeviceUUID || "Unknown Device",
//           device_type: "Inverter", // Assuming all devices are inverters
//           Date: moment().format("DD-MMM-YYYY"),
//           System_Date_Time: new Date().toISOString(),
//           device_make: deviceData.DeviceMake || "Unknown Make",
//           device_rating: deviceData.DeviceRating || "N/A",
//           rating_uom: deviceData.RatingUOM || "N/A",
//           dc_output: parseFloat(
//             deviceData.DCOutput?.reduce((sum, val) => sum + (val || 0), 0) || 0
//           ),
//           ac_output: parseFloat(deviceData.ACPowerTargetFields || 0),
//           peak_power: Math.max(...(deviceData.DCOutput || [0])),
//           peak_hour: Math.max(...(deviceData.DCOutput || [0])) * 0.95,
//           max_temperature: Math.max(
//             ...(deviceData.inverterTempTargetFields || [0])
//           ),
//         };

//         // Update plant-level totals
//         totalDCOutput += deviceSummary.dc_output;
//         totalACOutput += deviceSummary.ac_output;

//         // Add device summary to plant summary
//         plantSummary.devices.push(deviceSummary);
//       }

//       // Update plant-level metrics
//       plantSummary.dc_output = totalDCOutput;
//       plantSummary.ac_output = totalACOutput;

//       // Insert plant summary into the Daily_Summary collection
//       await dailySummary.insertOne(plantSummary);
//       console.log(`Inserted summary for plant ID: ${plantId}`);
//     }

//     console.log("Daily summaries generated successfully.");
//   } catch (error) {
//     console.error("Error generating daily summaries:", error);
//   } finally {
//     await client.close();
//   }
// })();

const MongoClient = require("mongodb").MongoClient;
const moment = require("moment");
require("dotenv").config();

const uri = process.env.MONGODB_URI; // MongoDB connection string
const dbName = process.env.MONGODB_DB_NAME; // Database name
const rawCollection = process.env.MONGODB_RAW_DATA_COLLECTION_NAME; // Raw data collection
const summaryCollection = process.env.MONGODB_DAILY_SUMMARY; // Summary collection

(async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const rawData = db.collection(rawCollection);
    const dailySummary = db.collection(summaryCollection);

    const currentDate = moment().format("YYYY-MM-DD");

    // Fetch all raw data records for the current date
    const plantRecords = await rawData
      .find({
        "DeviceUUIDMap.LocalDateTime": { $regex: `^${currentDate}` },
      })
      .toArray();

    // Group records by plant ID
    const plantGroups = plantRecords.reduce((acc, record) => {
      const plantId =
        record.DeviceUUIDMap.HeaderTarget.plant_id || "VISHNU-123";

      if (!acc[plantId]) {
        acc[plantId] = [];
      }
      acc[plantId].push(record);
      return acc;
    }, {});

    for (const [plantId, records] of Object.entries(plantGroups)) {
      const firstRecord = records[0].DeviceUUIDMap.HeaderTarget;

      // Initialize plant summary
      const plantSummary = {
        Entity_id: firstRecord.entityid || "UNKNOWN_ENTITY",
        plant_id: plantId,
        Time_zone: "+5:30 GMT",
        Date: moment().format("DD-MMM-YYYY"),
        System_Date_Time: new Date().toISOString(),
        plant_name: firstRecord.plant_name || "Unknown Plant",
        capacity: parseFloat(firstRecord.capacity || 0),
        plant_type: firstRecord.plant_category || "Unknown",
        country: firstRecord.country || "India",
        region: firstRecord.region || "N/A",
        state: firstRecord.state || "N/A",
        district: firstRecord.district || "N/A",
        dc_output: 0,
        dc_uom: "kWh",
        ac_output: 0,
        ac_uom: "kWh",
        cuf: 0,
        pr: 0,
        peak_power: 0,
        peak_hours: 0,
        total_hours: 0,
        co2_emission: 0,
        co2_saved: 0,
        trees_saved: 0,
        rec: 0,
        devices: [],
      };

      let totalACOutput = 0;
      let totalDCOutput = 0;
      let peakPower = 0;

      // Group records by Device ID
      const deviceGroups = records.reduce((acc, record) => {
        const deviceId = record.DeviceUUIDMap.DeviceUUID || "Unknown Device";

        if (!acc[deviceId]) {
          acc[deviceId] = [];
        }
        acc[deviceId].push(record);
        return acc;
      }, {});

      for (const [deviceId, deviceRecords] of Object.entries(deviceGroups)) {
        let deviceACOutput = 0;
        let deviceDCOutput = 0;
        let devicePeakPower = 0;
        let deviceMaxTemp = 0;

        for (const record of deviceRecords) {
          const deviceData = record.DeviceUUIDMap;

          deviceDCOutput += parseFloat(
            deviceData.DCOutput?.reduce((sum, val) => sum + (val || 0), 0) || 0
          );
          deviceACOutput += parseFloat(deviceData.ACPowerTargetFields || 0);
          devicePeakPower = Math.max(
            devicePeakPower,
            ...(deviceData.DCOutput || [0])
          );
          deviceMaxTemp = Math.max(
            deviceMaxTemp,
            ...(deviceData.inverterTempTargetFields || [0])
          );
        }

        // Compute device summary
        const deviceSummary = {
          device_id: deviceId,
          device_type: "Inverter",
          Date: moment().format("DD-MMM-YYYY"),
          System_Date_Time: new Date().toISOString(),
          device_make:
            deviceRecords[0].DeviceUUIDMap.DeviceMake || "Unknown Make",
          device_rating: deviceRecords[0].DeviceUUIDMap.DeviceRating || "N/A",
          rating_uom: deviceRecords[0].DeviceUUIDMap.RatingUOM || "N/A",
          dc_output: deviceDCOutput,
          ac_output: deviceACOutput,
          peak_power: devicePeakPower,
          peak_hour: devicePeakPower * 0.95,
          max_temperature: deviceMaxTemp,
        };

        // Update plant-level totals
        totalDCOutput += deviceSummary.dc_output;
        totalACOutput += deviceSummary.ac_output;
        if (deviceSummary.peak_power > peakPower) {
          peakPower = deviceSummary.peak_power;
        }

        // Add device summary to plant summary
        plantSummary.devices.push(deviceSummary);
      }

      // Update plant-level metrics
      plantSummary.dc_output = totalDCOutput;
      plantSummary.ac_output = totalACOutput;
      plantSummary.cuf =
        totalACOutput / (5 * ((plantSummary.capacity * 15) / 60 / 1000) || 1);
      plantSummary.pr =
        totalACOutput / ((0.85 * plantSummary.capacity * 15) / 60 / 1000 || 1);
      plantSummary.peak_power = peakPower;
      plantSummary.peak_hours = peakPower - 0.05 * peakPower;
      plantSummary.total_hours = (
        totalACOutput / plantSummary.capacity || 0
      ).toFixed(2);
      plantSummary.co2_emission = totalACOutput * 0.91;
      plantSummary.co2_saved = totalACOutput * 0.91;
      plantSummary.trees_saved = plantSummary.co2_saved / 21;
      plantSummary.rec = totalACOutput / 1000;

      // Insert plant summary into the Daily_Summary collection
      await dailySummary.insertOne(plantSummary);
      console.log(`Inserted summary for plant ID: ${plantId}`);
    }

    console.log("Daily summaries generated successfully.");
  } catch (error) {
    console.error("Error generating daily summaries:", error);
  } finally {
    await client.close();
  }
})();

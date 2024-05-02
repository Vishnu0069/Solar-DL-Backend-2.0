require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const plantdailyCollectionName = process.env.MONGODB_PLANT_DAILY_ENERGY;
const topPerformingCollectionName = process.env.MONGODB_TOP_PERFORMING_NAME;

async function calculateAndStoreTopPerformingPlants() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db(dbName);
    const sampleCollection = database.collection(plantdailyCollectionName);
    const topPerformingCollection = database.collection(topPerformingCollectionName);

    const plants = await sampleCollection.find({}).toArray();

    let topPerformingPlants = [];

    plants.forEach(plant => {
      const { Plantid, Date, PRPercent, Header } = plant;
      if (!Plantid || !Date) {
        console.error('Missing PlantID or Date for plant:', Header.PlantName);
        return;
      }

      const dataToInsert = {
        integratorId:Header.integratorId,
        plantId: Plantid,
        plantName: Header.PlantName,
        region: Header.Region,
        state: Header.State,
        district: Header.District,
        plantType: Header.PlantType,
        systemType: Header.PlantSystemType,
        date: Date,
        prPercent: PRPercent
      };

      topPerformingPlants.push(dataToInsert);
    });

    // Upsert logic to avoid duplicating entries for the same plant on the same date
    for (const plant of topPerformingPlants) {
      await topPerformingCollection.updateOne(
        { integratorId: plant.integratorId, plantId: plant.plantId, date: plant.date },
        { $set: plant },
        { upsert: true }
      );
    }

    console.log('Top performing plants have been calculated and stored.');
  } catch (err) {
    console.error('Failed to calculate or store top performing plants:', err);
  } finally {
    await client.close();
  }
}

calculateAndStoreTopPerformingPlants();

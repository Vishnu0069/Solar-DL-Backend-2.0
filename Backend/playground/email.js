const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb+srv://Vishnu1232:Vishnu1232@source-simulation-solis.lpokxhv.mongodb.net/?retryWrites=true&w=majority&appName=Source-Simulation-Solis";

// Email to query
const email = "e1doh@hotmail.com";

// Function to execute the email query
async function executeQuery(db, email) {
  const collection = db.collection('email');

  // Start counting operations
  const startOperationCount = db.serverStatus().opcounters.query;

  // Execute the query
  const result = await collection.findOne({ email: email });

  // End counting operations
  const endOperationCount = db.serverStatus().opcounters.query;

  // Calculate the number of operations for this query
  const numOperations = endOperationCount - startOperationCount;

  console.log(`Query for email ${email} took ${numOperations} operations`);

  return { email, numOperations, result };
}

// Connect to MongoDB and execute query
MongoClient.connect(uri, async (err, client) => {
  if (err) {
    console.error("Failed to connect to MongoDB:", err);
    return;
  }

  console.log("Connected to MongoDB");

  const db = client.db('Api');

  // Execute email query
  const queryResult = await executeQuery(db, email);

  // Write result to a text file
  fs.writeFileSync('email_query_result.txt', `Query Result for ${email}:\n\n`);
  fs.appendFileSync('email_query_result.txt', `Query: ${email} - ${queryResult.numOperations} operations\n`);
  fs.appendFileSync('email_query_result.txt', `Data: ${JSON.stringify(queryResult.result)}\n\n`);

  console.log("Result written to email_query_result.txt");

  // Close MongoDB connection
  client.close();
});

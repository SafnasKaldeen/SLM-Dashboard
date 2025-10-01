import { MongoClient } from "mongodb";

// Ensure the MongoDB URI is loaded properly
// console.log("MONGODB_URI:", process.env.MONGODB_URI); // For debugging purposes

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = "apispec"; // Replace with your database name

let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to ensure the MongoClient is not repeatedly created
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = (async () => {
      try {
        await client.connect();
        // console.log("MongoDB connected successfully in development");
        return client;
      } catch (err) {
        // console.error("MongoDB connection failed in development", err);
      }
    })();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, it's safe to directly create the MongoClient promise
  clientPromise = (async () => {
    try {
      await client.connect();
      // console.log("MongoDB connected successfully in production");
      return client;
    } catch (err) {
      console.error("MongoDB connection failed in production", err);
    }
  })();
}

export default clientPromise;

import mongoose, { type ConnectOptions, type Mongoose } from "mongoose";
import { config } from "../config";


const MONGODB_URI = config.MONGODB_URI;

declare const global: {
  mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null };
};

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
const defaultDb =
  process.env.NODE_ENV === "production" ? "production" : "testing";
// const defaultDb = "production"

async function dbConnect(dbName: string = defaultDb): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      dbName,
    };

    try {
      mongoose.set("strictQuery", false);
      cached.promise = mongoose
        .connect(
          `${MONGODB_URI} + "?retryWrites=true&w=majority&appName=nith"`,
          opts
        )
        .then((mongoose) => {
          console.log("Connected to MongoDB to database:", dbName);
          return mongoose;
        });
    } catch (err) {
      console.error("Error connecting to MongoDB:", err);
      throw err;
    }
  }

  return cached.conn ? cached.conn : await cached.promise;
}

export default dbConnect;

import { Db, MongoClient, MongoClientOptions } from "mongodb";
import mongoose, { type ConnectOptions, type Mongoose } from "mongoose";

declare const global: {
  mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null };
  mongoClient: {
    client: MongoClient | null;
    promise: Promise<MongoClient> | null;
  };
};

// Checked on connect, not on import, so Next's build-time page-data collection
// doesn't need a database URI to load modules that merely reference one.
function requireMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Please define the MONGODB_URI environment variable");
  return uri;
}

const defaultDb =
  process.env.NODE_ENV === "production" ? "production" : "testing";

// Mongoose Connection Cache
let mongooseCache = global.mongoose;
if (!mongooseCache) {
  mongooseCache = global.mongoose = { conn: null, promise: null };
}

// MongoClient Connection Cache
let mongoClientCache = global.mongoClient;
if (!mongoClientCache) {
  mongoClientCache = global.mongoClient = { client: null, promise: null };
}

// Shared MongoDB connection options
const mongoOptions: ConnectOptions = {
  retryWrites: true,
  w: "majority",
  appName: "nith",
};

async function dbConnect(dbName: string = defaultDb): Promise<Mongoose> {
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  if (!mongooseCache.promise) {
    const opts: ConnectOptions = {
      ...mongoOptions,
      dbName,
    };

    try {
      mongoose.set("strictQuery", false);
      mongooseCache.promise = mongoose
        .connect(requireMongoUri(), opts)
        .then((mongoose) => {
          console.log("Connected to MongoDB to database:", dbName);
          return mongoose;
        });
    } catch (err) {
      console.error("Error connecting to MongoDB:", err);
      throw err;
    }
  }

  mongooseCache.conn = await mongooseCache.promise;
  return mongooseCache.conn;
}

const mongoClientOptions: MongoClientOptions = {
  retryWrites: true,
  w: "majority",
  appName: "nith",
};
async function getMongoClient(
  dbName: string = defaultDb
): Promise<{ client: MongoClient; db: Db }> {
  if (mongoClientCache.client) {
    return {
      client: mongoClientCache.client,
      db: mongoClientCache.client.db(dbName),
    };
  }

  if (!mongoClientCache.promise) {
    try {
      const client = new MongoClient(requireMongoUri(), mongoClientOptions);
      mongoClientCache.promise = client.connect().then((connectedClient) => {
        console.log("Connected to MongoDB via native client");
        return connectedClient;
      });
    } catch (err) {
      console.error("Native client connection error:", err);
      throw err;
    }
  }

  mongoClientCache.client = await mongoClientCache.promise;
  return {
    client: mongoClientCache.client,
    db: mongoClientCache.client.db(dbName),
  };
}

export { getMongoClient };
export default dbConnect;

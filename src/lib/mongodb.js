import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

const dbName = process.env.MONGODB_DB || "plantity";

let cached = global._mongoClient;

if (!cached) {
  cached = global._mongoClient = { client: null, promise: null };
}

export async function getDb() {
  if (cached.client) return cached.client.db(dbName);
  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect().then((connected) => {
      cached.client = connected;
      return connected;
    });
  }
  const client = await cached.promise;
  return client.db(dbName);
}

import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGO_URI!;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) throw new Error('MONGO_URI is not defined');

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
    const c = await clientPromise;
    return c.db(); // db name is in the URI
}

export default clientPromise;

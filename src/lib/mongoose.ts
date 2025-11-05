// lib/mongoose.ts - For Mongoose-specific connections
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

declare global {
    var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
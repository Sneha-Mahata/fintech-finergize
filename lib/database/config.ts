import mongoose from 'mongoose';

declare global {
  interface GlobalWithMongoose {
    mongoose: {
      conn: mongoose.Connection | null;
      promise: Promise<mongoose.Mongoose> | null;
    } | undefined;
  }
}

declare const global: GlobalWithMongoose;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'MongoDB URI not found. Please define MONGODB_URI in your .env.local file'
  );
}

let cached = global.mongoose ?? {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<mongoose.Connection> {
  try {
    console.log('Connection attempt started...');
    console.log('Connection state:', mongoose.connection.readyState);

    if (cached.conn) {
      console.log('Using cached connection');
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      console.log('Creating new connection...');
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
      const mongoose_instance = await cached.promise;
      cached.conn = mongoose_instance.connection;
      
      console.log('MongoDB Connected Successfully');
      console.log('Database:', cached.conn.name);
      console.log('Host:', cached.conn.host);
      
      cached.conn.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      cached.conn.on('disconnected', () => {
        console.log('MongoDB disconnected');
        cached.conn = null;
        cached.promise = null;
      });

      return cached.conn;
    } catch (error) {
      cached.promise = null;
      throw error;
    }
  } catch (error) {
    console.error('Detailed connection error:', error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export default dbConnect;
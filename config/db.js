const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB connection failed (${env.mongoUri}): ${err.message}`);
    console.error('Is mongod running? On macOS: brew services start mongodb-community');
    process.exit(1);
  }
}

module.exports = connectDB;

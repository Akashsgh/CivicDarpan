const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civiclens';
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    console.error('Please ensure MongoDB is running locally or specify a valid MONGODB_URI in .env');
    process.exit(1);
  }
};

module.exports = connectDB;

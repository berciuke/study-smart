const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/study_smart_notifications');
    console.log(`POŁĄCZONO z MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error('ERROR POŁĄCZENIA z MongoDB:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = connectDB; 
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/study_smart');
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
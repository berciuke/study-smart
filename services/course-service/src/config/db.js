const { Sequelize } = require('sequelize');
require('dotenv').config();

const getDatabaseName = () => {
  if (process.env.NODE_ENV === 'test') {
    return 'study_smart_test';  
  }
  return process.env.POSTGRES_DB || 'study_smart';
};

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USER || 'pg',
  password: process.env.POSTGRES_PASSWORD || 'pg',
  database: getDatabaseName(),
  logging: false
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`POŁĄCZONO z PostgreSQL: ${getDatabaseName()}`);
  } catch (error) {
    console.error('ERROR POŁĄCZENIA z PostgreSQL:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
}; 
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USER || 'pg',
  password: process.env.POSTGRES_PASSWORD || 'pg',
  database: process.env.POSTGRES_DB || 'study_smart',
  logging: false
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('POŁĄCZONO z PostgreSQL');
  } catch (error) {
    console.error('ERROR POŁĄCZENIA z PostgreSQL:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
}; 
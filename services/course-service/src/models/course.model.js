const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const courseInstructorIdField = process.env.NODE_ENV === 'test' 
  ? {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  : {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'id'
      }
    };

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('początkujący', 'średniozaawansowany', 'zaawansowany'),
    defaultValue: 'początkujący'
  },
  duration: {
    type: DataTypes.INTEGER, // minuty
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  instructorId: courseInstructorIdField
}, {
  indexes: [
    { fields: ['instructorId'] }, 
    { fields: ['category'] }, 
    { fields: ['isActive', 'createdAt'] }, 
    { fields: ['difficulty'] }, 
    { fields: ['price'] }, 
  ]
});

module.exports = Course; 
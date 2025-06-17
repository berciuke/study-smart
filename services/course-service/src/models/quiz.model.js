const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Quiz = sequelize.define('Quiz', {
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
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  passingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  indexes: [
    { fields: ['courseId'] },
    { fields: ['instructorId'] },
    { fields: ['isActive'] }
  ]
});

module.exports = Quiz; 
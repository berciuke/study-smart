const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  enrolledAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'dropped'),
    defaultValue: 'active'
  },
  progress: {
    type: DataTypes.INTEGER, // 0-100 (procent)
    defaultValue: 0
  }
}, {
  indexes: [
    { fields: ['userId'] },
    { fields: ['courseId'] },
    { fields: ['userId', 'courseId'], unique: true }, 
    { fields: ['status'] },
    { fields: ['enrolledAt'] }
  ]
});

module.exports = Enrollment; 
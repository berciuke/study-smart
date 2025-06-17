const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuizSubmission = sequelize.define('QuizSubmission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Quizzes',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  indexes: [
    { fields: ['quizId'] },
    { fields: ['userId'] },
    { fields: ['quizId', 'userId'], unique: true },
    { fields: ['submittedAt'] },
    { fields: ['passed'] }
  ]
});

module.exports = QuizSubmission; 
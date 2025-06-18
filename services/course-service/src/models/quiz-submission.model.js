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
    field: 'quiz_id',
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
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
    defaultValue: 0,
    field: 'correct_answers'
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_questions'
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'submitted_at'
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'time_spent'
  }
}, {
  tableName: 'quiz_submissions',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['quiz_id'] },
    { fields: ['user_id'] },
    { fields: ['quiz_id', 'user_id'], unique: true },
    { fields: ['submitted_at'] },
    { fields: ['passed'] }
  ]
});

module.exports = QuizSubmission; 
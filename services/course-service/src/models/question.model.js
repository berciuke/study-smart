const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Question = sequelize.define('Question', {
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
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 1000]
    }
  },
  questionType: {
    type: DataTypes.ENUM('single_choice'),
    defaultValue: 'single_choice'
  },
  optionA: {
    type: DataTypes.STRING,
    allowNull: false
  },
  optionB: {
    type: DataTypes.STRING,
    allowNull: false
  },
  optionC: {
    type: DataTypes.STRING,
    allowNull: false
  },
  optionD: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correctAnswer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  indexes: [
    { fields: ['quizId'] },
    { fields: ['quizId', 'order'] }
  ]
});

module.exports = Question; 
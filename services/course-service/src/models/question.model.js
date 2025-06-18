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
    field: 'quiz_id',
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question_text',
    validate: {
      len: [10, 1000]
    }
  },
  questionType: {
    type: DataTypes.ENUM('single_choice'),
    defaultValue: 'single_choice',
    field: 'question_type'
  },
  optionA: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_a'
  },
  optionB: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_b'
  },
  optionC: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_c'
  },
  optionD: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_d'
  },
  correctAnswer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
    field: 'correct_answer'
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
  tableName: 'questions',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['quiz_id'] },
    { fields: ['quiz_id', 'order'] }
  ]
});

module.exports = Question; 
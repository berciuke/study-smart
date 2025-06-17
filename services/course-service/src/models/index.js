const Course = require('./course.model');
const Enrollment = require('./enrollment.model');
const Quiz = require('./quiz.model');
const Question = require('./question.model');
const QuizSubmission = require('./quiz-submission.model');
const Resource = require('./resource.model');

// Course -> Enrollment relations
Course.hasMany(Enrollment, { 
  foreignKey: 'courseId', 
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Enrollment.belongsTo(Course, { 
  foreignKey: 'courseId', 
  as: 'course' 
});

// Course -> Quiz relations
Course.hasMany(Quiz, {
  foreignKey: 'courseId',
  as: 'quizzes',
  onDelete: 'CASCADE'
});

Quiz.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// Quiz -> Question relations
Quiz.hasMany(Question, {
  foreignKey: 'quizId',
  as: 'questions',
  onDelete: 'CASCADE'
});

Question.belongsTo(Quiz, {
  foreignKey: 'quizId',
  as: 'quiz'
});

// Quiz -> QuizSubmission relations
Quiz.hasMany(QuizSubmission, {
  foreignKey: 'quizId',
  as: 'submissions',
  onDelete: 'CASCADE'
});

QuizSubmission.belongsTo(Quiz, {
  foreignKey: 'quizId',
  as: 'quiz'
});

// Resource relationships
Course.hasMany(Resource, { 
  foreignKey: 'courseId', 
  as: 'resources',
  onDelete: 'CASCADE'
});
Resource.belongsTo(Course, { 
  foreignKey: 'courseId', 
  as: 'course' 
});

module.exports = {
  Course,
  Enrollment,
  Quiz,
  Question,
  QuizSubmission,
  Resource
}; 
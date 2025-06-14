const Course = require('./course.model');
const Enrollment = require('./enrollment.model');

Course.hasMany(Enrollment, { 
  foreignKey: 'courseId', 
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Enrollment.belongsTo(Course, { 
  foreignKey: 'courseId', 
  as: 'course' 
});

module.exports = {
  Course,
  Enrollment
}; 
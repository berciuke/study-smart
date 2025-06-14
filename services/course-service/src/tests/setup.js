const { sequelize } = require('../config/db');
const { Course, Enrollment } = require('../models');

let createdCourseIds = [];
let createdEnrollmentIds = [];

global.trackCreatedCourse = (course) => {
  createdCourseIds.push(course.id);
};

global.trackCreatedEnrollment = (enrollment) => {
  createdEnrollmentIds.push(enrollment.id);
};

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  // Usuwam testowe rekordy
  if (createdEnrollmentIds.length > 0) {
    await Enrollment.destroy({
      where: {
        id: createdEnrollmentIds
      }
    });
  }
  if (createdCourseIds.length > 0) {
    await Course.destroy({
      where: {
        id: createdCourseIds
      }
    });
  }
  await sequelize.close();
}); 
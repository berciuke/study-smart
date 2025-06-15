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

// Mockowanie user-service
jest.mock('../services/user.service', () => ({
  validateUser: jest.fn(),
  validateInstructor: jest.fn(),
  getUserById: jest.fn()
}));

beforeAll(async () => {
  // Synchronizuj tabele BEZ foreign key constraints dla testów
  await sequelize.sync({ force: true, logging: false });
  
  // Setup mock responses
  const userService = require('../services/user.service');
  
  // Mock studenta
  userService.validateUser.mockImplementation((token) => {
    if (token === 'Bearer mock-student-token') {
      return Promise.resolve({
        id: 1,
        email: 'student@example.com',
        firstName: 'Jan',
        lastName: 'Student',
        role: 'student'
      });
    }
    if (token === 'Bearer mock-instructor-token') {
      return Promise.resolve({
        id: 2,
        email: 'instructor@example.com',
        firstName: 'Anna',
        lastName: 'Instructor',
        role: 'instruktor'
      });
    }
    throw new Error('Invalid token');
  });
  
  // Mock instruktora
  userService.validateInstructor.mockImplementation((token) => {
    if (token === 'Bearer mock-instructor-token') {
      return Promise.resolve({
        id: 2,
        email: 'instructor@example.com',
        firstName: 'Anna',
        lastName: 'Instructor',
        role: 'instruktor'
      });
    }
    throw new Error('Brak uprawnień instruktora');
  });
  
  // Mock getUserById
  userService.getUserById.mockImplementation((userId) => {
    if (userId === 2) {
      return Promise.resolve({
        id: 2,
        email: 'instructor@example.com',
        firstName: 'Anna',
        lastName: 'Instructor',
        role: 'instruktor'
      });
    }
    throw new Error('User not found');
  });
});

// Wyczyść między testami
beforeEach(async () => {
  // Usuwaj wszystkie dane przed każdym testem dla czystości
  // Kolejność jest ważna - najpierw Enrollment, potem Course
  await Enrollment.destroy({ where: {} });
  await Course.destroy({ where: {} });
  createdCourseIds = [];
  createdEnrollmentIds = [];
});

afterAll(async () => {
  // Cleanup na końcu wszystkich testów
  try {
    await Enrollment.destroy({ where: {} });
    await Course.destroy({ where: {} });
  } catch (error) {
    console.log('Cleanup error:', error.message);
  }
  
  await sequelize.close();
}); 
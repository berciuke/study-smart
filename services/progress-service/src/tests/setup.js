const mongoose = require('mongoose');
const Progress = require('../models/progress.model');

jest.mock('../services/user.service', () => ({
  validateUser: jest.fn(),
  getUserById: jest.fn()
}));

jest.mock('../services/course.service', () => ({
  getCourseById: jest.fn(),
  getEnrollment: jest.fn(),
  getAllCourses: jest.fn()
}));

beforeAll(async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study_smart_test';
  await mongoose.connect(MONGODB_URI);
  
  const userService = require('../services/user.service');
  const courseService = require('../services/course.service');
  
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
  
  userService.getUserById.mockImplementation((userId) => {
    if (userId === 1) {
      return Promise.resolve({
        id: 1,
        email: 'student@example.com',
        firstName: 'Jan',
        lastName: 'Student',
        role: 'student'
      });
    }
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
  
  courseService.getCourseById.mockImplementation((courseId) => {
    if (courseId === 1) {
      return Promise.resolve({
        id: 1,
        title: 'Test Course',
        category: 'programowanie',
        instructorId: 2,
        isActive: true,
        enrollments: [
          { userId: 1, status: 'active' }
        ]
      });
    }
    throw new Error('Course not found');
  });
  
  courseService.getEnrollment.mockImplementation((userId, courseId) => {
    if (userId === 1 && courseId === 1) {
      return Promise.resolve({
        userId: 1,
        courseId: 1,
        status: 'active'
      });
    }
    return Promise.resolve(null);
  });
});

beforeEach(async () => {    
  await Progress.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
}); 
const { sequelize } = require('../config/db');
const { Course, Enrollment } = require('../models');

jest.mock('../services/user.service', () => ({
  validateUser: jest.fn(),
  validateInstructor: jest.fn(),
  getUserById: jest.fn()
}));

beforeAll(async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "firstName" VARCHAR(255),
        "lastName" VARCHAR(255),
        "role" VARCHAR(50) DEFAULT 'student',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    await sequelize.query(`
      INSERT INTO "Users" ("id", "email", "firstName", "lastName", "role") 
      VALUES 
        (1, 'student@example.com', 'Jan', 'Student', 'student'),
        (2, 'instructor@example.com', 'Anna', 'Instructor', 'instruktor')
      ON CONFLICT ("email") DO NOTHING;
    `);
    
    await sequelize.query(`
      SELECT setval(pg_get_serial_sequence('"Users"', 'id'), COALESCE(MAX(id), 1)) FROM "Users";
    `);
  } catch (error) {
  }
  
  await Course.sync({ force: true, logging: false });
  await Enrollment.sync({ force: true, logging: false });
  
  const userService = require('../services/user.service');
  
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
});

beforeEach(async () => {
  await Enrollment.destroy({ where: {} });
  await Course.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
}); 
const { sequelize } = require('../config/db');

let testTransaction = null;

const getTestTransaction = () => {
  if (!testTransaction) {
    throw new Error('Test transaction not initialized. Call beforeEach setup first.');
  }
  return testTransaction;
};

// Mock user service
const mockUserService = {
  validateUser: jest.fn(),
  validateInstructor: jest.fn(),
  getUser: jest.fn()
};

jest.mock('../services/user.service', () => mockUserService);

beforeEach(async () => {
  // Start transaction for test isolation
  testTransaction = await sequelize.transaction();
  
  // Reset mocks
  jest.clearAllMocks();
  
  // Default mock responses
  mockUserService.validateUser.mockResolvedValue({
    id: 3,
    email: 'student@test.com',
    role: 'student',
    firstName: 'Test',
    lastName: 'Student'
  });
  
  mockUserService.validateInstructor.mockResolvedValue({
    id: 2,
    email: 'instructor@test.com', 
    role: 'instructor',
    firstName: 'Test',
    lastName: 'Instructor'
  });
  
  mockUserService.getUser.mockResolvedValue({
    id: 2,
    email: 'instructor@test.com',
    firstName: 'Test',
    lastName: 'Instructor'
  });
});

afterEach(async () => {
  if (testTransaction) {
    await testTransaction.rollback();
    testTransaction = null;
  }
});

module.exports = {
  getTestTransaction,
  mockUserService
}; 
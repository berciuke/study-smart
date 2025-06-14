const request = require('supertest');
const express = require('express');
const courseRoutes = require('../routes/course.routes');
const { Course, Enrollment } = require('../models');
require('./setup');

const app = express();
app.use(express.json());
app.use('/api/courses', courseRoutes);

describe('Course Service API', () => {
  let instructorToken, studentToken;
  let testCourse;

  beforeAll(async () => {
    instructorToken = 'Bearer mock-instructor-token';
    studentToken = 'Bearer mock-student-token';
  });

  describe('GET /api/courses', () => {
    it('powinno zwrócić kursy z licznikiem enrollments', async () => {
      const res = await request(app)
        .get('/api/courses');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('courses');
      expect(Array.isArray(res.body.courses)).toBe(true);
    });
  });

  describe('GET /api/courses/:id', () => {
    it('powinno zwrócić 404 dla nieistniejącego kursu', async () => {
      const res = await request(app)
        .get('/api/courses/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Kurs nie został znaleziony');
    });
  });

  afterAll(async () => {
    try {
      await Course.destroy({ where: {}, truncate: true, cascade: true });
      await Enrollment.destroy({ where: {}, truncate: true, cascade: true });
    } catch (error) {
      console.log('Cleanup error:', error.message);
    }
  });
});

module.exports = app; 
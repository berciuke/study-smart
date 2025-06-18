const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/user.routes');
const { prisma } = require('../config/db');
require('./setup');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Service API', () => {
  let adminToken, studentToken;
  let studentUser, adminUser;
  const testPassword = 'TestPass123!'; 

  beforeAll(async () => {
    const studentRes = await request(app)
      .post('/api/users/register')
      .send({
        email: 'student@example.com',
        password: testPassword,
        firstName: 'Jan',
        lastName: 'Testowy',
        role: 'student'
      });
    
    studentUser = await prisma.user.findUnique({ where: { email: 'student@example.com' } });
    if (studentUser) global.trackCreatedUser(studentUser);

    const adminRes = await request(app)
      .post('/api/users/register')
      .send({
        email: 'admin@example.com',
        password: testPassword,
        firstName: 'Admin',
        lastName: 'Testowy',
        role: 'administrator'
      });
    
    adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
    if (adminUser) global.trackCreatedUser(adminUser);

    const studentLoginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'student@example.com',
        password: testPassword
      });
    studentToken = studentLoginRes.body.token;

    const adminLoginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'admin@example.com',
        password: testPassword
      });
    adminToken = adminLoginRes.body.token;
  });

  describe('POST /api/users/register', () => {
    it('powinno odrzucić nieprawidłowy email', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'nieprawidlowy',
          password: testPassword
        });

      expect(res.statusCode).toBe(400);
    });

    it('powinno odrzucić istniejący email', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'student@example.com',
          password: testPassword
        });

      expect(res.statusCode).toBe(400);
    });

    it('powinno odrzucić słabe hasło', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'newuser@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Błędy walidacji');
    });

    it('powinno odrzucić nieprawidłowe imię', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'newuser2@example.com',
          password: testPassword,
          firstName: '1',
          lastName: 'User'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/users/login', () => {
    it('powinno zalogować studenta', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'student@example.com',
          password: testPassword
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('powinno zalogować administratora', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'admin@example.com',
          password: testPassword
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('GET /api/users/profile', () => {
    it('powinno zwrócić profil zalogowanego użytkownika', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', 'student@example.com');
    });

    it('powinno odrzucić nieprawidłowy token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer nieprawidlowy');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('powinno zaktualizować profil użytkownika', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          firstName: 'NoweImie',
          lastName: 'NoweNazwisko'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.firstName).toBe('NoweImie');
      expect(res.body.lastName).toBe('NoweNazwisko');
    });
  });

  describe('GET /api/users', () => {
    it('powinno pozwolić administratorowi na listowanie użytkowników', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('powinno zabronić studentowi listowania użytkowników', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
}); 
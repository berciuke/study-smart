const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/user.routes');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Service API', () => {
  describe('POST /api/users/register', () => {
    it('powinno zarejestrować nowego użytkownika', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          email: 'janek@example.com',
          password: 'haslojanka123',
          firstName: 'Janek',
          lastName: 'Testowy'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('email', 'janek@example.com');
      expect(res.body).not.toHaveProperty('password');
    });
  });

  describe('POST /api/users/login', () => {
    it('powinno zwrócić token przy poprawnym logowaniu', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'janek@example.com',
          password: 'haslojanka123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
}); 
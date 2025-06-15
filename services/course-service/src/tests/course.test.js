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

  beforeAll(async () => {
    instructorToken = 'Bearer mock-instructor-token';
    studentToken = 'Bearer mock-student-token';
  });

  describe('POST /api/courses', () => {
    it('powinno utworzyć kurs przez instruktora', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'This is a test course description',
        category: 'programowanie',
        difficulty: 'początkujący',
        duration: 120,
        price: 99.99
      };

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', instructorToken)
        .send(courseData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(courseData.title);
      expect(res.body.instructorId).toBe(2);
    });

    it('powinno odrzucić tworzenie kursu bez autoryzacji', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          title: 'Unauthorized Course',
          category: 'programowanie'
        });

      expect(res.statusCode).toBe(401); // brak tokenu = 401
    });

    it('powinno odrzucić tworzenie kursu przez studenta', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', studentToken)
        .send({
          title: 'Student Course',
          category: 'programowanie'
        });

      expect(res.statusCode).toBe(403);
    });

    it('powinno odrzucić kurs z za krótkim tytułem', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', instructorToken)
        .send({
          title: 'AB', // za krótki
          category: 'programowanie'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('minimum 3 znaki');
    });

    it('powinno odrzucić kurs z nieprawidłową kategorią', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', instructorToken)
        .send({
          title: 'Test Course',
          category: 'nieprawidlowa'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('programowanie, marketing, biznes, języki, inne');
    });

    it('powinno odrzucić kurs z nieprawidłowym poziomem trudności', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', instructorToken)
        .send({
          title: 'Test Course',
          category: 'programowanie',
          difficulty: 'bardzo_trudny'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('początkujący, średniozaawansowany, zaawansowany');
    });

    it('powinno odrzucić kurs z ujemną ceną', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', instructorToken)
        .send({
          title: 'Test Course',
          category: 'programowanie',
          price: -10
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('ujemna');
    });

    it('powinno odrzucić kurs z za krótkim czasem trwania', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', instructorToken)
        .send({
          title: 'Test Course',
          category: 'programowanie',
          duration: 2 // za krótki
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('minimum 5 minut');
    });
  });

  describe('GET /api/courses', () => {
    beforeEach(async () => {
      // Utwórz testowy kurs dla każdego testu
      await Course.create({
        title: 'Test Course',
        category: 'programowanie',
        difficulty: 'początkujący',
        instructorId: 2,
        isActive: true
      });
    });

    it('powinno zwrócić listę kursów (publiczne)', async () => {
      const res = await request(app)
        .get('/api/courses');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('courses');
      expect(Array.isArray(res.body.courses)).toBe(true);
      expect(res.body).toHaveProperty('totalCount');
      expect(res.body).toHaveProperty('currentPage');
      expect(res.body).toHaveProperty('totalPages');
    });

    it('powinno filtrować kursy po kategorii', async () => {
      const res = await request(app)
        .get('/api/courses?category=programowanie');

      expect(res.statusCode).toBe(200);
      expect(res.body.courses.every(course => course.category === 'programowanie')).toBe(true);
    });

    it('powinno filtrować kursy po poziomie trudności', async () => {
      const difficultyEncoded = encodeURIComponent('początkujący');
      const res = await request(app)
        .get(`/api/courses?difficulty=${difficultyEncoded}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.courses.every(course => course.difficulty === 'początkujący')).toBe(true);
    });
  });

  describe('GET /api/courses/:id', () => {
    let testCourse;

    beforeEach(async () => {
      testCourse = await Course.create({
        title: 'Test Course for Get',
        category: 'programowanie',
        instructorId: 2,
        isActive: true
      });
    });

    it('powinno zwrócić szczegóły kursu (publiczne)', async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(testCourse.id);
      expect(res.body).toHaveProperty('enrollments');
    });

    it('powinno zwrócić 404 dla nieistniejącego kursu', async () => {
      const res = await request(app)
        .get('/api/courses/999999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Kurs nie został znaleziony');
    });
  });

  describe('POST /api/courses/:id/enroll', () => {
    let testCourse;

    beforeEach(async () => {
      testCourse = await Course.create({
        title: 'Test Course for Enrollment',
        category: 'programowanie',
        instructorId: 2,
        isActive: true
      });
    });

    it('powinno zapisać studenta na kurs', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourse.id}/enroll`)
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(201);
      expect(res.body.userId).toBe(1);
      expect(res.body.courseId).toBe(testCourse.id);
    });

    it('powinno odrzucić podwójny zapis na ten sam kurs', async () => {
      // Pierwszy zapis
      await request(app)
        .post(`/api/courses/${testCourse.id}/enroll`)
        .set('Authorization', studentToken);

      // Próba ponownego zapisu
      const res = await request(app)
        .post(`/api/courses/${testCourse.id}/enroll`)
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Już jesteś zapisany');
    });

    it('powinno odrzucić zapis bez autoryzacji', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourse.id}/enroll`);

      expect(res.statusCode).toBe(401);
    });

    it('powinno odrzucić zapis na nieistniejący kurs', async () => {
      const res = await request(app)
        .post('/api/courses/999999/enroll')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toContain('niedostępny');
    });
  });

  describe('PUT /api/courses/:id', () => {
    let testCourse;

    beforeEach(async () => {
      testCourse = await Course.create({
        title: 'Test Course for Update',
        category: 'programowanie',
        instructorId: 2,
        isActive: true
      });
    });

    it('powinno zaktualizować kurs przez właściciela', async () => {
      const updateData = {
        title: 'Updated Course Title',
        price: 149.99
      };

      const res = await request(app)
        .put(`/api/courses/${testCourse.id}`)
        .set('Authorization', instructorToken)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe(updateData.title);
      expect(parseFloat(res.body.price)).toBe(updateData.price);
    });

    it('powinno odrzucić aktualizację bez autoryzacji', async () => {
      const res = await request(app)
        .put(`/api/courses/${testCourse.id}`)
        .send({ title: 'Unauthorized Update' });

      expect(res.statusCode).toBe(401); // brak tokenu = 401
    });

    it('powinno odrzucić aktualizację przez studenta', async () => {
      const res = await request(app)
        .put(`/api/courses/${testCourse.id}`)
        .set('Authorization', studentToken)
        .send({ title: 'Student Update' });

      expect(res.statusCode).toBe(403);
    });

    it('powinno odrzucić aktualizację nieistniejącego kursu', async () => {
      const res = await request(app)
        .put('/api/courses/999999')
        .set('Authorization', instructorToken)
        .send({ title: 'Non-existent Course' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/courses/enrollments/my', () => {
    it('powinno zwrócić zapisy studenta', async () => {
      const res = await request(app)
        .get('/api/courses/enrollments/my')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('enrollments');
      expect(Array.isArray(res.body.enrollments)).toBe(true);
    });

    it('powinno odrzucić bez autoryzacji', async () => {
      const res = await request(app)
        .get('/api/courses/enrollments/my');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/courses/:id/enrollments', () => {
    let testCourse;

    beforeEach(async () => {
      testCourse = await Course.create({
        title: 'Test Course for Enrollments',
        category: 'programowanie',
        instructorId: 2,
        isActive: true
      });
    });

    it('powinno zwrócić zapisy kursu dla instruktora', async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse.id}/enrollments`)
        .set('Authorization', instructorToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('enrollments');
      expect(Array.isArray(res.body.enrollments)).toBe(true);
    });

    it('powinno odrzucić bez autoryzacji', async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse.id}/enrollments`);

      expect(res.statusCode).toBe(401); // brak tokenu = 401
    });

    it('powinno odrzucić dla studenta', async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourse.id}/enrollments`)
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    let testCourse;

    beforeEach(async () => {
      testCourse = await Course.create({
        title: 'Course to Delete',
        category: 'programowanie',
        instructorId: 2,
        isActive: true
      });
    });

    it('powinno usunąć kurs przez właściciela', async () => {
      const res = await request(app)
        .delete(`/api/courses/${testCourse.id}`)
        .set('Authorization', instructorToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('usunięty');
    });

    it('powinno odrzucić usunięcie bez autoryzacji', async () => {
      const res = await request(app)
        .delete(`/api/courses/${testCourse.id}`);

      expect(res.statusCode).toBe(401); // brak tokenu = 401
    });

    it('powinno odrzucić usunięcie przez studenta', async () => {
      const res = await request(app)
        .delete(`/api/courses/${testCourse.id}`)
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(403);
    });
  });
});

module.exports = app; 
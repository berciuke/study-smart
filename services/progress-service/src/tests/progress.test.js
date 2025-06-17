const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Progress = require('../models/progress.model');
require('./setup');

describe('Progress Service API', () => {
  let studentToken, instructorToken;

  beforeAll(async () => {
    studentToken = 'Bearer mock-student-token';
    instructorToken = 'Bearer mock-instructor-token';
  });

  describe('POST /api/progress/update', () => {
    it('powinno aktualizować postęp studenta', async () => {
      const progressData = {
        courseId: 1,
        lessonId: 1,
        timeSpent: 30,
        longitude: 19.0569,
        latitude: 50.0647
      };

      const res = await request(app)
        .post('/api/progress/update')
        .set('Authorization', studentToken)
        .send(progressData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('zaktualizowany');
      expect(res.body.progress).toHaveProperty('userId', 1);
      expect(res.body.progress).toHaveProperty('courseId', 1);
    });

    it('powinno odrzucić aktualizację bez enrollment', async () => {
      const progressData = {
        courseId: 999, // nieistniejący kurs
        lessonId: 1,
        timeSpent: 30
      };

      const res = await request(app)
        .post('/api/progress/update')
        .set('Authorization', studentToken)
        .send(progressData);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('zapisany');
    });

    it('powinno odrzucić bez autoryzacji', async () => {
      const res = await request(app)
        .post('/api/progress/update')
        .send({ courseId: 1 });

      expect(res.statusCode).toBe(401);
    });

    it('powinno walidować dane wejściowe', async () => {
      const invalidData = {
        courseId: 'invalid',
        timeSpent: -10
      };

      const res = await request(app)
        .post('/api/progress/update')
        .set('Authorization', studentToken)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/progress/user/:userId', () => {
    beforeEach(async () => {
      // Dodaj testowy progress
      await Progress.create({
        userId: 1,
        courseId: 1,
        completedLessons: [{ lessonId: 1 }, { lessonId: 2 }],
        totalTimeSpent: 120,
        completionPercentage: 20,
        studyLocation: {
          type: 'Point',
          coordinates: [19.0569, 50.0647] // Kraków
        }
      });
    });

    it('powinno zwrócić postęp użytkownika', async () => {
      const res = await request(app)
        .get('/api/progress/user/1')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('progress');
      expect(Array.isArray(res.body.progress)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
    });

    it('powinno filtrować po statusie', async () => {
      const res = await request(app)
        .get('/api/progress/user/1?status=in_progress')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(200);
    });

    it('powinno obsługiwać paginację', async () => {
      const res = await request(app)
        .get('/api/progress/user/1?page=1&limit=5')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.itemsPerPage).toBe(5);
    });

    it('powinno zabronić dostępu do cudzych danych', async () => {
      const res = await request(app)
        .get('/api/progress/user/999')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/progress/stats/course/:courseId', () => {
    beforeEach(async () => {
      // Dodaj testowe dane dla statystyk
      await Progress.create([
        {
          userId: 1,
          courseId: 1,
          completionPercentage: 50,
          totalTimeSpent: 120,
          lastActivity: new Date()
        },
        {
          userId: 2,
          courseId: 1,
          completionPercentage: 75,
          totalTimeSpent: 180,
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 dni temu
        }
      ]);
    });

    it('powinno zwrócić statystyki kursu dla instruktora', async () => {
      const res = await request(app)
        .get('/api/progress/stats/course/1')
        .set('Authorization', instructorToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('courseStats');
      expect(res.body).toHaveProperty('progressDistribution');
      expect(res.body).toHaveProperty('activityHours');
    });

    it('powinno zabronić dostępu studentom', async () => {
      const res = await request(app)
        .get('/api/progress/stats/course/1')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(403);
    });

    it('powinno zwrócić 404 dla nieistniejącego kursu', async () => {
      const res = await request(app)
        .get('/api/progress/stats/course/999')
        .set('Authorization', instructorToken);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/progress/stats/user/:userId', () => {
    beforeEach(async () => {
      await Progress.create([
        {
          userId: 1,
          courseId: 1,
          completionPercentage: 100,
          totalTimeSpent: 300,
          completedLessons: [
            { lessonId: 1, completedAt: new Date() },
            { lessonId: 2, completedAt: new Date() }
          ]
        },
        {
          userId: 1,
          courseId: 2,
          completionPercentage: 50,
          totalTimeSpent: 150
        }
      ]);
    });

    it('powinno zwrócić statystyki użytkownika', async () => {
      const res = await request(app)
        .get('/api/progress/stats/user/1')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('userStats');
      expect(res.body).toHaveProperty('progressOverTime');
    });

    it('powinno zabronić dostępu do cudzych statystyk', async () => {
      const res = await request(app)
        .get('/api/progress/stats/user/999')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/progress/locations/:courseId', () => {
    beforeEach(async () => {
      await Progress.create([
        {
          userId: 1,
          courseId: 1,
          studyLocation: {
            type: 'Point',
            coordinates: [19.0569, 50.0647] // Kraków
          }
        },
        {
          userId: 2,
          courseId: 1,
          studyLocation: {
            type: 'Point',
            coordinates: [21.0122, 52.2297] // Warszawa
          }
        }
      ]);
    });

    it('powinno zwrócić lokalizacje nauki dla instruktora', async () => {
      const res = await request(app)
        .get('/api/progress/locations/1')
        .set('Authorization', instructorToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('courseId', 1);
      expect(res.body).toHaveProperty('studyLocations');
      expect(res.body).toHaveProperty('type', 'FeatureCollection');
      expect(res.body).toHaveProperty('features');
      expect(Array.isArray(res.body.features)).toBe(true);
    });

    it('powinno zabronić dostępu studentom', async () => {
      const res = await request(app)
        .get('/api/progress/locations/1')
        .set('Authorization', studentToken);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('MongoDB Aggregations Tests', () => {
    beforeEach(async () => {
      await Progress.create([
        {
          userId: 1,
          courseId: 1,
          completionPercentage: 25,
          totalTimeSpent: 60,
          lastActivity: new Date(),
          completedLessons: [
            { lessonId: 1, completedAt: new Date() }
          ]
        },
        {
          userId: 2,
          courseId: 1,
          completionPercentage: 75,
          totalTimeSpent: 180,
          lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dni temu
          completedLessons: [
            { lessonId: 1, completedAt: new Date() },
            { lessonId: 2, completedAt: new Date() }
          ]
        }
      ]);
    });

    it('powinno poprawnie liczyć statystyki kursu (agregacje)', async () => {
      const stats = await Progress.getCourseStats(1);
      
      expect(stats).toHaveLength(1);
      expect(stats[0]).toHaveProperty('totalStudents', 2);
      expect(stats[0]).toHaveProperty('averageProgress', 50); // (25 + 75) / 2
      expect(stats[0]).toHaveProperty('totalTimeSpent', 240); // 60 + 180
      expect(stats[0]).toHaveProperty('activeStudents', 1); // tylko 1 aktywny w ostatnim tygodniu
    });

    it('powinno poprawnie liczyć statystyki użytkownika (agregacje)', async () => {
      const stats = await Progress.getUserStats(1);
      
      expect(stats).toHaveLength(1);
      expect(stats[0]).toHaveProperty('totalCourses', 1);
      expect(stats[0]).toHaveProperty('averageProgress', 25);
      expect(stats[0]).toHaveProperty('totalTimeSpent', 60);
      expect(stats[0]).toHaveProperty('completedCourses', 0);
    });
  });

  describe('GeoJSON Tests', () => {
    beforeEach(async () => {
      await Progress.create([
        {
          userId: 1,
          courseId: 1,
          studyLocation: {
            type: 'Point',
            coordinates: [19.0569, 50.0647] // Kraków
          }
        },
        {
          userId: 2,
          courseId: 1,
          studyLocation: {
            type: 'Point',
            coordinates: [21.0122, 52.2297] // Warszawa
          }
        },
        {
          userId: 3,
          courseId: 1,
          studyLocation: {
            type: 'Point',
            coordinates: [0, 0] // Null Island - powinno być filtrowane
          }
        }
      ]);
    });

    it('powinno zwracać prawidłowe dane GeoJSON', async () => {
      const locations = await Progress.getStudyLocations(1);
      
      expect(locations).toHaveLength(1);
      expect(locations[0]).toHaveProperty('locations');
      expect(locations[0].locations).toHaveLength(2); // Tylko 2, bez [0,0]
      
      locations[0].locations.forEach(location => {
        expect(location).toHaveProperty('type', 'Point');
        expect(location).toHaveProperty('coordinates');
        expect(Array.isArray(location.coordinates)).toBe(true);
        expect(location.coordinates).toHaveLength(2);
        // Sprawdź że nie ma [0,0]
        expect(location.coordinates).not.toEqual([0, 0]);
      });
    });
  });
});

module.exports = app; 
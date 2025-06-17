const request = require('supertest');
const express = require('express');
const { sequelize } = require('../config/db');
const { Resource, Course } = require('../models');
const resourceRoutes = require('../routes/resource.routes');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use('/api', resourceRoutes);

// Mock auth middleware
jest.mock('../middleware/auth.middleware', () => {
  return (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      role: 'instructor'
    };
    next();
  };
});

describe('Resource Management', () => {
  let testCourse;
  let testResource;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test course
    testCourse = await Course.create({
      title: 'Test Course',
      description: 'Test description',
      category: 'Technology',
      difficulty: 'Beginner',
      duration: 60,
      price: 99.99,
      status: 'active'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    // Clean up uploaded files and database
    await Resource.destroy({ where: {}, force: true });
  });

  describe('POST /api/courses/:courseId/resources', () => {
    it('should create a text resource successfully', async () => {
      const resourceData = {
        title: 'Test Text Resource',
        description: 'Test description',
        type: 'text',
        accessLevel: 'enrolled'
      };

      const response = await request(app)
        .post(`/api/courses/${testCourse.id}/resources`)
        .send(resourceData)
        .expect(201);

      expect(response.body.message).toBe('Resource created successfully');
      expect(response.body.resource.title).toBe(resourceData.title);
      expect(response.body.resource.type).toBe(resourceData.type);
      expect(response.body.resource.version).toBe(1);
    });

    it('should create a resource with file upload', async () => {
      // Create a test file
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');

      const response = await request(app)
        .post(`/api/courses/${testCourse.id}/resources`)
        .field('title', 'Test File Resource')
        .field('type', 'document')
        .field('description', 'Test file upload')
        .attach('file', testFilePath)
        .expect(201);

      expect(response.body.resource.fileName).toBe('test-file.txt');
      expect(response.body.resource.fileSize).toBeGreaterThan(0);
      expect(response.body.resource.mimeType).toBe('text/plain');

      // Clean up
      fs.unlinkSync(testFilePath);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/courses/${testCourse.id}/resources`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate resource type', async () => {
      const response = await request(app)
        .post(`/api/courses/${testCourse.id}/resources`)
        .send({
          title: 'Test Resource',
          type: 'invalid-type'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/courses/:courseId/resources', () => {
    beforeEach(async () => {
      // Create test resources
      await Resource.bulkCreate([
        {
          courseId: testCourse.id,
          title: 'Video Resource',
          type: 'video',
          accessLevel: 'enrolled',
          isActive: true
        },
        {
          courseId: testCourse.id,
          title: 'Audio Resource',
          type: 'audio',
          accessLevel: 'public',
          isActive: true
        },
        {
          courseId: testCourse.id,
          title: 'Inactive Resource',
          type: 'text',
          accessLevel: 'enrolled',
          isActive: false
        }
      ]);
    });

    it('should get all active resources for a course', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourse.id}/resources`)
        .expect(200);

      expect(response.body.resources).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.resources.every(r => r.isActive)).toBe(true);
    });

    it('should filter resources by type', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourse.id}/resources?type=video`)
        .expect(200);

      expect(response.body.resources).toHaveLength(1);
      expect(response.body.resources[0].type).toBe('video');
    });

    it('should filter resources by access level', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourse.id}/resources?accessLevel=public`)
        .expect(200);

      expect(response.body.resources).toHaveLength(1);
      expect(response.body.resources[0].accessLevel).toBe('public');
    });
  });

  describe('GET /api/resources/:id', () => {
    beforeEach(async () => {
      testResource = await Resource.create({
        courseId: testCourse.id,
        title: 'Test Resource',
        type: 'text',
        accessLevel: 'enrolled',
        isActive: true
      });
    });

    it('should get a single resource', async () => {
      const response = await request(app)
        .get(`/api/resources/${testResource.id}`)
        .expect(200);

      expect(response.body.resource.id).toBe(testResource.id);
      expect(response.body.resource.title).toBe(testResource.title);
    });

    it('should return 404 for non-existent resource', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await request(app)
        .get(`/api/resources/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/resources/:id', () => {
    beforeEach(async () => {
      testResource = await Resource.create({
        courseId: testCourse.id,
        title: 'Test Resource',
        type: 'text',
        accessLevel: 'enrolled',
        version: 1,
        isActive: true
      });
    });

    it('should update resource without versioning', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/resources/${testResource.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Resource updated successfully');
      
      const updated = await Resource.findByPk(testResource.id);
      expect(updated.title).toBe(updateData.title);
      expect(updated.description).toBe(updateData.description);
      expect(updated.version).toBe(1); // Version should not change
    });

    it('should create new version when requested', async () => {
      const updateData = {
        title: 'New Version Title',
        createVersion: 'true'
      };

      const response = await request(app)
        .put(`/api/resources/${testResource.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Resource updated with new version');
      expect(response.body.resource.version).toBe(2);
      expect(response.body.resource.title).toBe(updateData.title);

      // Check that old version is deactivated
      const oldVersion = await Resource.findByPk(testResource.id);
      expect(oldVersion.isActive).toBe(false);
    });
  });

  describe('DELETE /api/resources/:id', () => {
    beforeEach(async () => {
      testResource = await Resource.create({
        courseId: testCourse.id,
        title: 'Test Resource',
        type: 'text',
        accessLevel: 'enrolled',
        isActive: true
      });
    });

    it('should soft delete a resource', async () => {
      const response = await request(app)
        .delete(`/api/resources/${testResource.id}`)
        .expect(200);

      expect(response.body.message).toBe('Resource deleted successfully');

      const deleted = await Resource.findByPk(testResource.id);
      expect(deleted.isActive).toBe(false);
    });
  });
});

describe('Resource Access Control', () => {
  let testCourse, testResource;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    testCourse = await Course.create({
      title: 'Test Course',
      description: 'Test description',
      category: 'Technology',
      difficulty: 'Beginner',
      duration: 60,
      price: 99.99,
      status: 'active'
    });

    testResource = await Resource.create({
      courseId: testCourse.id,
      title: 'Premium Resource',
      type: 'video',
      accessLevel: 'premium',
      isActive: true
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should deny access to premium content for regular users', async () => {
    // Mock user with student role
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: 'test-user', role: 'student' };
      next();
    });
    app.use('/api', resourceRoutes);

    const response = await request(app)
      .get(`/api/resources/${testResource.id}`)
      .expect(403);

    expect(response.body.error).toBe('Access denied');
  });
}); 
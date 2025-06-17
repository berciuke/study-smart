const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { validateUser, requireInstructor } = require('../middleware/cross-service.middleware');
const validate = require('../middleware/validation.middleware');
const { createCourseSchema, updateCourseSchema } = require('../validation/course.validation');

// Import quiz routes
const quizRoutes = require('./quiz.routes');

// Publiczne - wszystkie kursy
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Chronione - enrollment
router.post('/:id/enroll', validateUser, courseController.enrollInCourse);
router.get('/enrollments/my', validateUser, courseController.getMyEnrollments);

// Instruktor/Admin - zarządzanie kursami
router.post('/', requireInstructor, validate(createCourseSchema), courseController.createCourse);
router.put('/:id', requireInstructor, validate(updateCourseSchema), courseController.updateCourse);
router.delete('/:id', requireInstructor, courseController.deleteCourse);
router.get('/:id/enrollments', requireInstructor, courseController.getCourseEnrollments);

// Quiz routes - /api/courses/:courseId/quizzes/*
// Use proper parameter merging for nested routes
router.use('/:courseId/quizzes', (req, res, next) => {
  // Pass courseId parameter to nested router
  req.courseId = req.params.courseId;
  next();
}, quizRoutes);

module.exports = router; 
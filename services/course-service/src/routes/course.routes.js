const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { validateUser, requireInstructor } = require('../middleware/cross-service.middleware');
const validate = require('../middleware/validation.middleware');
const { createCourseSchema, updateCourseSchema } = require('../validation/course.validation');

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

module.exports = router; 
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { authenticateToken, requireInstructor } = require('../middleware/auth.middleware');
const { validate, validateQuery } = require('../middleware/validation.middleware');
const { updateProgressSchema, progressQuerySchema } = require('../validation/progress.validation');

router.get('/user/:userId', 
  authenticateToken,
  validateQuery(progressQuerySchema),
  progressController.getUserProgress
);

router.post('/update', 
  authenticateToken,
  validate(updateProgressSchema),
  progressController.updateProgress
);

router.get('/stats/course/:courseId', 
  authenticateToken, 
  requireInstructor,
  progressController.getCourseStats
);

router.get('/stats/user/:userId', 
  authenticateToken,
  progressController.getUserStats
);

router.get('/locations/:courseId', 
  authenticateToken, 
  requireInstructor,
  progressController.getStudyLocations
);

module.exports = router; 
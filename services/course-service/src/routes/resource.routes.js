const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resource.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { resourceValidation } = require('../validation/resource.validation');

// Apply authentication to all routes
router.use(verifyToken);

// Create resource (with file upload)
router.post('/courses/:courseId/resources', 
  resourceValidation.createResource,
  resourceController.createResource
);

// Get all resources for a course
router.get('/courses/:courseId/resources', 
  resourceValidation.getCourseResources,
  resourceController.getCourseResources
);

// Get single resource
router.get('/resources/:id', 
  resourceValidation.getResource,
  resourceController.getResource
);

// Stream resource file
router.get('/resources/:id/stream', 
  resourceValidation.getResource,
  resourceController.streamResource
);

// Update resource
router.put('/resources/:id', 
  resourceValidation.updateResource,
  resourceController.updateResource
);

// Delete resource
router.delete('/resources/:id', 
  resourceValidation.deleteResource,
  resourceController.deleteResource
);

module.exports = router; 
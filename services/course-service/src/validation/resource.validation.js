const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const createResource = [
  param('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a valid integer'),
  
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('type')
    .isIn(['text', 'video', 'audio', 'document', 'simulation'])
    .withMessage('Type must be one of: text, video, audio, document, simulation'),
  
  body('accessLevel')
    .optional()
    .isIn(['public', 'enrolled', 'premium', 'instructor'])
    .withMessage('Access level must be one of: public, enrolled, premium, instructor'),
  
  body('streamingConfig')
    .optional()
    .custom((value) => {
      if (value) {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Streaming config must be valid JSON');
        }
      }
      return true;
    }),
  
  body('metadata')
    .optional()
    .custom((value) => {
      if (value) {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Metadata must be valid JSON');
        }
      }
      return true;
    }),
  
  handleValidationErrors
];

const getCourseResources = [
  param('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a valid integer'),
  
  query('type')
    .optional()
    .isIn(['text', 'video', 'audio', 'document', 'simulation'])
    .withMessage('Type must be one of: text, video, audio, document, simulation'),
  
  query('accessLevel')
    .optional()
    .isIn(['public', 'enrolled', 'premium', 'instructor'])
    .withMessage('Access level must be one of: public, enrolled, premium, instructor'),
  
  handleValidationErrors
];

const getResource = [
  param('id')
    .isUUID()
    .withMessage('Resource ID must be a valid UUID'),
  
  handleValidationErrors
];

const updateResource = [
  param('id')
    .isUUID()
    .withMessage('Resource ID must be a valid UUID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('accessLevel')
    .optional()
    .isIn(['public', 'enrolled', 'premium', 'instructor'])
    .withMessage('Access level must be one of: public, enrolled, premium, instructor'),
  
  body('streamingConfig')
    .optional()
    .custom((value) => {
      if (value) {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Streaming config must be valid JSON');
        }
      }
      return true;
    }),
  
  body('metadata')
    .optional()
    .custom((value) => {
      if (value) {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Metadata must be valid JSON');
        }
      }
      return true;
    }),
  
  body('createVersion')
    .optional()
    .isBoolean()
    .withMessage('Create version must be a boolean'),
  
  handleValidationErrors
];

const deleteResource = [
  param('id')
    .isUUID()
    .withMessage('Resource ID must be a valid UUID'),
  
  handleValidationErrors
];

module.exports = {
  resourceValidation: {
    createResource,
    getCourseResources,
    getResource,
    updateResource,
    deleteResource
  }
}; 
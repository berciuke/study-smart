const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams for :courseId
const quizController = require('../controllers/quiz.controller');
const { validateUser, requireInstructor } = require('../middleware/cross-service.middleware');
const validate = require('../middleware/validation.middleware');
const { createQuizSchema, submitQuizSchema, quizQuerySchema } = require('../validation/quiz.validation');

// GET /api/courses/:courseId/quizzes - lista quizów kursu (publiczne)
router.get('/', quizController.getCourseQuizzes);

// POST /api/courses/:courseId/quizzes - utworz quiz (instructor only)
router.post('/', 
  requireInstructor, 
  validate(createQuizSchema), 
  quizController.createQuiz
);

// GET /api/courses/:courseId/quizzes/:quizId - szczegóły quizu (publiczne)
router.get('/:quizId', quizController.getQuizById);

// POST /api/courses/:courseId/quizzes/:quizId/submit - wyślij odpowiedzi (student)
router.post('/:quizId/submit', 
  validateUser, 
  validate(submitQuizSchema), 
  quizController.submitQuiz
);

// GET /api/courses/:courseId/quizzes/:quizId/results - wyniki quizu (instructor only)
router.get('/:quizId/results', 
  requireInstructor, 
  quizController.getQuizResults
);

// GET /api/courses/:courseId/quizzes/submissions/my - moje wyniki (student)
// Note: This must come after other routes to avoid conflicts
router.get('/submissions/my', 
  validateUser, 
  quizController.getMySubmissions
);

module.exports = router; 
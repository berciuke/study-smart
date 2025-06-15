const Joi = require('joi');

const validTitle = require('./course-validation-helpers/validTitle');
const validCategory = require('./course-validation-helpers/validCategory');
const validDescription = require('./course-validation-helpers/validDescription');
const validDifficulty = require('./course-validation-helpers/validDifficulty');
const validDuration = require('./course-validation-helpers/validDuration');
const validPrice = require('./course-validation-helpers/validPrice');
const validStatus = require('./course-validation-helpers/validStatus');

const createCourseSchema = Joi.object({
  title: validTitle,
  description: validDescription,
  category: validCategory,
  difficulty: validDifficulty,
  duration: validDuration,
  price: validPrice
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone'
});

const updateCourseSchema = Joi.object({
  title: validTitle.optional(),
  description: validDescription,
  category: validCategory.optional(),
  difficulty: validDifficulty,
  duration: validDuration,
  price: validPrice,
  isActive: Joi.boolean().messages({
    'boolean.base': 'Pole isActive musi być wartością logiczną'
  })
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.min(1)
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone',
  'object.min': 'Należy podać przynajmniej jedno pole do aktualizacji'
});

const courseQuerySchema = Joi.object({
  category: validCategory.optional(),
  difficulty: validDifficulty,
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Strona musi być liczbą',
    'number.integer': 'Strona musi być liczbą całkowitą',
    'number.min': 'Strona musi być większa od 0'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit musi być liczbą',
    'number.integer': 'Limit musi być liczbą całkowitą',
    'number.min': 'Limit musi być większy od 0',
    'number.max': 'Limit może być maksymalnie 100'
  }),
  status: validStatus
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Parametr "{#label}" nie jest dozwolony'
});

const enrollmentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Strona musi być liczbą',
    'number.integer': 'Strona musi być liczbą całkowitą',
    'number.min': 'Strona musi być większa od 0'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit musi być liczbą',
    'number.integer': 'Limit musi być liczbą całkowitą',
    'number.min': 'Limit musi być większy od 0',
    'number.max': 'Limit może być maksymalnie 100'
  }),
  status: validStatus
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Parametr "{#label}" nie jest dozwolony'
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  enrollmentQuerySchema
}; 
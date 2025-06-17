const Joi = require('joi');

const updateProgressSchema = Joi.object({
  courseId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID kursu musi być liczbą',
      'number.integer': 'ID kursu musi być liczbą całkowitą',
      'number.positive': 'ID kursu musi być liczbą dodatnią',
      'any.required': 'ID kursu jest wymagane'
    }),
  
  lessonId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID lekcji musi być liczbą',
      'number.integer': 'ID lekcji musi być liczbą całkowitą',
      'number.positive': 'ID lekcji musi być liczbą dodatnią'
    }),
  
  timeSpent: Joi.number()
    .integer()
    .min(1)
    .max(1440) // max 24h
    .optional()
    .messages({
      'number.base': 'Czas nauki musi być liczbą',
      'number.integer': 'Czas nauki musi być liczbą całkowitą',
      'number.min': 'Czas nauki musi być minimum {#limit} minuty',
      'number.max': 'Czas nauki może być maksymalnie {#limit} minut (24h)'
    }),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
      'number.base': 'Długość geograficzna musi być liczbą',
      'number.min': 'Długość geograficzna musi być między -180 a 180',
      'number.max': 'Długość geograficzna musi być między -180 a 180'
    }),
  
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
      'number.base': 'Szerokość geograficzna musi być liczbą',
      'number.min': 'Szerokość geograficzna musi być między -90 a 90',
      'number.max': 'Szerokość geograficzna musi być między -90 a 90'
    })
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone'
});

const progressQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Strona musi być liczbą',
      'number.integer': 'Strona musi być liczbą całkowitą',
      'number.min': 'Strona musi być większa od 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit musi być liczbą',
      'number.integer': 'Limit musi być liczbą całkowitą',
      'number.min': 'Limit musi być większy od 0',
      'number.max': 'Limit może być maksymalnie 100'
    }),
  
  status: Joi.string()
    .valid('completed', 'in_progress', 'not_started')
    .optional()
    .messages({
      'any.only': 'Status musi być jednym z: completed, in_progress, not_started'
    })
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Parametr "{#label}" nie jest dozwolony'
});

module.exports = {
  updateProgressSchema,
  progressQuerySchema
}; 
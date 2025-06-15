const Joi = require('joi');

const validDuration = Joi.number()
  .integer()
  .min(5)
  .max(10000)
  .optional()
  .messages({
    'number.base': 'Czas trwania musi być liczbą',
    'number.integer': 'Czas trwania musi być liczbą całkowitą',
    'number.min': 'Czas trwania musi być minimum {#limit} minut',
    'number.max': 'Czas trwania może być maksymalnie {#limit} minut'
  });

module.exports = validDuration; 
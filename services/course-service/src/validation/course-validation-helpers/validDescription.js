const Joi = require('joi');

const validDescription = Joi.string()
  .trim()
  .min(10)
  .max(1000)
  .optional()
  .messages({
    'string.base': 'Opis musi być tekstem',
    'string.min': 'Opis musi mieć minimum {#limit} znaków',
    'string.max': 'Opis może mieć maksymalnie {#limit} znaków'
  });

module.exports = validDescription; 
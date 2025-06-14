const Joi = require('joi');

const validTitle = Joi.string()
  .trim()
  .min(3)
  .max(100)
  .required()
  .messages({
    'string.base': 'Tytuł musi być tekstem',
    'string.empty': 'Tytuł nie może być pusty',
    'string.min': 'Tytuł musi mieć minimum {#limit} znaki',
    'string.max': 'Tytuł może mieć maksymalnie {#limit} znaków',
    'any.required': 'Tytuł jest wymagany'
  });

module.exports = validTitle; 
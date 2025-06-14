const Joi = require('joi');

const validEmail = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } }) 
  .min(5)
  .max(254) 
  .required()
  .messages({
    'string.base': 'Email musi być tekstem',
    'string.empty': 'Email nie może być pusty',
    'string.email': 'Nieprawidłowy format email',
    'string.min': 'Email musi mieć minimum {#limit} znaków',
    'string.max': 'Email może mieć maksymalnie {#limit} znaków',
    'any.required': 'Email jest wymagany'
  });

module.exports = validEmail; 
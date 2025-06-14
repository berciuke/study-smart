const Joi = require('joi');

const validPassword = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.base': 'Hasło musi być tekstem',
    'string.empty': 'Hasło nie może być puste',
    'string.min': 'Hasło musi mieć minimum {#limit} znaków',
    'string.max': 'Hasło może mieć maksymalnie {#limit} znaków',
    'string.pattern.base': 'Hasło musi zawierać: małą literę, wielką literę, cyfrę i znak specjalny (@$!%*?&)',
    'any.required': 'Hasło jest wymagane'
  });

module.exports = validPassword; 
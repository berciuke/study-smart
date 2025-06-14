const Joi = require('joi');

const validName = Joi.string()
  .trim()
  .min(2)
  .max(50)
  .pattern(/^[A-Za-zÀ-ÖØ-öø-ÿąćęłńóśźżĄĆĘŁŃÓŚŹŻ\- ]+$/)
  .required()
  .messages({
    'string.base': 'Pole musi być tekstem',
    'string.empty': 'Pole nie może być puste',
    'string.min': 'Pole musi mieć minimum {#limit} znaki',
    'string.max': 'Pole może mieć maksymalnie {#limit} znaków',
    'string.pattern.base': 'Pole może zawierać tylko litery, spacje i myślniki',
    'any.required': 'Pole jest wymagane'
  });

module.exports = validName; 
const Joi = require('joi');

const validPrice = Joi.number()
  .min(0)
  .max(9999.99)
  .precision(2)
  .default(0)
  .messages({
    'number.base': 'Cena musi być liczbą',
    'number.min': 'Cena nie może być ujemna',
    'number.max': 'Cena może być maksymalnie {#limit}',
    'number.precision': 'Cena może mieć maksymalnie 2 miejsca po przecinku'
  });

module.exports = validPrice; 
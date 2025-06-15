const Joi = require('joi');

const validDifficulty = Joi.string()
  .valid('początkujący', 'średniozaawansowany', 'zaawansowany')
  .default('początkujący')
  .messages({
    'any.only': 'Poziom trudności musi być jednym z: początkujący, średniozaawansowany, zaawansowany'
  });

module.exports = validDifficulty; 
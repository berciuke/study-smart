const Joi = require('joi');

const validStatus = Joi.string()
  .valid('active', 'completed', 'dropped')
  .default('active')
  .messages({
    'any.only': 'Status musi być jednym z: active, completed, dropped'
  });

module.exports = validStatus; 
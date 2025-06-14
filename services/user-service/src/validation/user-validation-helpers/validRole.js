const Joi = require('joi');

const validRole = Joi.string()
  .valid('student', 'instruktor', 'administrator', 'mentor')
  .default('student')
  .messages({
    'any.only': 'Rola musi być jedną z: student, instruktor, administrator, mentor'
  });

module.exports = validRole; 
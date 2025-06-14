const Joi = require('joi');

const validCategory = Joi.string()
  .valid('programowanie', 'marketing', 'biznes', 'języki', 'inne')
  .required()
  .messages({
    'any.only': 'Kategoria musi być jedną z: programowanie, marketing, biznes, języki, inne',
    'any.required': 'Kategoria jest wymagana'
  });

module.exports = validCategory; 
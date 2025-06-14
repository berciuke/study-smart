const Joi = require('joi');

const validTitle = require('./course-validation-helpers/validTitle');
const validCategory = require('./course-validation-helpers/validCategory');

const createCourseSchema = Joi.object({
  title: validTitle,
  description: Joi.string().trim().max(1000).optional(),
  category: validCategory,
  difficulty: Joi.string()
    .valid('początkujący', 'średniozaawansowany', 'zaawansowany')
    .default('początkujący'),
  duration: Joi.number().integer().min(1).max(10000).optional(),
  price: Joi.number().min(0).max(9999.99).default(0)
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone'
});

module.exports = {
  createCourseSchema
}; 
const Joi = require('joi');

const validName = require('./user-validation-helpers/validName');
const validRequiredName = require('./user-validation-helpers/validRequiredName');
const validEmail = require('./user-validation-helpers/validEmail');
const validPassword = require('./user-validation-helpers/validPassword');
const validRole = require('./user-validation-helpers/validRole');

const registerSchema = Joi.object({
  email: validEmail,
  password: validPassword,
  firstName: validRequiredName,
  lastName: validRequiredName,
  role: validRole
})
.options({
  stripUnknown: true, // żeby serwer nie widział dodatkowych pól
  abortEarly: false   // żeby zwracało wszystkie błędy naraz
})
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone'
});

const loginSchema = Joi.object({
  email: validEmail,
  password: Joi.string()
    .required()
    .messages({
      'string.base': 'Hasło musi być tekstem',
      'string.empty': 'Hasło nie może być puste',
      'any.required': 'Hasło jest wymagane'
    })
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone'
});

const updateProfileSchema = Joi.object({
  firstName: validName,
  lastName: validName
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.min(1) // conajmniej jedneo pole
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone',
  'object.min': 'Należy podać przynajmniej jedno pole do aktualizacji'
});

// ===== DODATKOWE SCHEMATY =====

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.base': 'Obecne hasło musi być tekstem',
      'string.empty': 'Obecne hasło nie może być puste',
      'any.required': 'Obecne hasło jest wymagane'
    }),
  newPassword: validPassword
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone'
});

const resetPasswordSchema = Joi.object({
  email: validEmail
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone'
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  resetPasswordSchema
}; 
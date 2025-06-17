const Joi = require('joi');

const createQuizSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Tytuł musi być tekstem',
      'string.empty': 'Tytuł nie może być pusty',
      'string.min': 'Tytuł musi mieć minimum {#limit} znaki',
      'string.max': 'Tytuł może mieć maksymalnie {#limit} znaków',
      'any.required': 'Tytuł jest wymagany'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.base': 'Opis musi być tekstem',
      'string.max': 'Opis może mieć maksymalnie {#limit} znaków'
    }),
  
  passingScore: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .default(60)
    .messages({
      'number.base': 'Próg zaliczenia musi być liczbą',
      'number.integer': 'Próg zaliczenia musi być liczbą całkowitą',
      'number.min': 'Próg zaliczenia musi być minimum {#limit}',
      'number.max': 'Próg zaliczenia może być maksymalnie {#limit}'
    }),
  
  questions: Joi.array()
    .items(
      Joi.object({
        questionText: Joi.string()
          .trim()
          .min(10)
          .max(1000)
          .required()
          .messages({
            'string.base': 'Treść pytania musi być tekstem',
            'string.min': 'Treść pytania musi mieć minimum {#limit} znaków',
            'string.max': 'Treść pytania może mieć maksymalnie {#limit} znaków',
            'any.required': 'Treść pytania jest wymagana'
          }),
        
        optionA: Joi.string()
          .trim()
          .min(1)
          .max(200)
          .required()
          .messages({
            'string.base': 'Opcja A musi być tekstem',
            'string.min': 'Opcja A nie może być pusta',
            'string.max': 'Opcja A może mieć maksymalnie {#limit} znaków',
            'any.required': 'Opcja A jest wymagana'
          }),
        
        optionB: Joi.string()
          .trim()
          .min(1)
          .max(200)
          .required()
          .messages({
            'string.base': 'Opcja B musi być tekstem',
            'string.min': 'Opcja B nie może być pusta',
            'string.max': 'Opcja B może mieć maksymalnie {#limit} znaków',
            'any.required': 'Opcja B jest wymagana'
          }),
        
        optionC: Joi.string()
          .trim()
          .min(1)
          .max(200)
          .required()
          .messages({
            'string.base': 'Opcja C musi być tekstem',
            'string.min': 'Opcja C nie może być pusta',
            'string.max': 'Opcja C może mieć maksymalnie {#limit} znaków',
            'any.required': 'Opcja C jest wymagana'
          }),
        
        optionD: Joi.string()
          .trim()
          .min(1)
          .max(200)
          .required()
          .messages({
            'string.base': 'Opcja D musi być tekstem',
            'string.min': 'Opcja D nie może być pusta',
            'string.max': 'Opcja D może mieć maksymalnie {#limit} znaków',
            'any.required': 'Opcja D jest wymagana'
          }),
        
        correctAnswer: Joi.string()
          .valid('A', 'B', 'C', 'D')
          .required()
          .messages({
            'any.only': 'Poprawna odpowiedź musi być jedną z: A, B, C, D',
            'any.required': 'Poprawna odpowiedź jest wymagana'
          }),
        
        explanation: Joi.string()
          .trim()
          .max(500)
          .optional()
          .messages({
            'string.base': 'Wyjaśnienie musi być tekstem',
            'string.max': 'Wyjaśnienie może mieć maksymalnie {#limit} znaków'
          })
      })
    )
    .min(1)
    .max(50)
    .optional()
    .messages({
      'array.base': 'Pytania muszą być tablicą',
      'array.min': 'Musi być przynajmniej {#limit} pytanie',
      'array.max': 'Może być maksymalnie {#limit} pytań'
    })
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone'
});

const submitQuizSchema = Joi.object({
  answers: Joi.object()
    .pattern(
      Joi.number().integer().positive(),
      Joi.string().valid('A', 'B', 'C', 'D')
    )
    .required()
    .messages({
      'object.base': 'Odpowiedzi muszą być obiektem',
      'any.required': 'Odpowiedzi są wymagane'
    }),
  
  timeSpent: Joi.number()
    .integer()
    .min(0)
    .max(7200)
    .optional()
    .messages({
      'number.base': 'Czas musi być liczbą',
      'number.integer': 'Czas musi być liczbą całkowitą',
      'number.min': 'Czas nie może być ujemny',
      'number.max': 'Czas może być maksymalnie {#limit} sekund'
    })
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Pole "{#label}" nie jest dozwolone'
});

const quizQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Strona musi być liczbą',
      'number.integer': 'Strona musi być liczbą całkowitą',
      'number.min': 'Strona musi być większa od 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      'number.base': 'Limit musi być liczbą',
      'number.integer': 'Limit musi być liczbą całkowitą',
      'number.min': 'Limit musi być większy od 0',
      'number.max': 'Limit może być maksymalnie {#limit}'
    })
})
.options({
  stripUnknown: true,
  abortEarly: false
})
.messages({
  'object.unknown': 'Parametr "{#label}" nie jest dozwolony'
});

module.exports = {
  createQuizSchema,
  submitQuizSchema,
  quizQuerySchema
}; 
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      if (errors.length === 1) {
        return res.status(400).json({ 
          error: errors[0].message,
          field: errors[0].field
        });
      }

      return res.status(400).json({ 
        error: 'Błędy walidacji',
        errors: errors
      });
    }

    req.body = value; 
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      if (errors.length === 1) {
        return res.status(400).json({ 
          error: errors[0].message,
          field: errors[0].field
        });
      }

      return res.status(400).json({ 
        error: 'Błędy walidacji zapytania',
        errors: errors
      });
    }

    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery
}; 
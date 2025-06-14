const userService = require('../services/user.service');

const validateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
    }

    const user = await userService.validateUser(token);
    req.user = user;
    next();
  } catch (error) {
    console.error('[validateUser]', error);
    res.status(401).json({ error: 'Nieprawidłowy token użytkownika' });
  }
};

const requireInstructor = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    const user = await userService.validateInstructor(token);
    req.user = user;
    next();
  } catch (error) {
    console.error('[requireInstructor]', error);
    res.status(403).json({ error: 'Brak uprawnień instruktora' });
  }
};

module.exports = {
  validateUser,
  requireInstructor
}; 
const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');

const authenticateToken = async (req, res, next) => {
  try {
    console.log('[DEBUG Auth] Headers:', req.headers.authorization);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('[DEBUG Auth] No token');
      return res.status(401).json({ error: 'Token uwierzytelniania wymagany' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'najlepiej_dlugi_i_losowy');
      console.log('[DEBUG Auth] Token decoded:', decoded);
    } catch (jwtError) {
      console.log('[DEBUG Auth] JWT Error:', jwtError.message);
      return res.status(403).json({ error: 'Nieprawidłowy token' });
    }

    try {
      console.log('[DEBUG Auth] Calling userService.validateUser');
      const userData = await userService.validateUser(authHeader);
      console.log('[DEBUG Auth] User data:', userData);
      req.user = userData;
      next();
    } catch (serviceError) {
      console.log('[DEBUG Auth] UserService Error:', serviceError.message);
      return res.status(401).json({ error: 'Błąd weryfikacji użytkownika' });
    }
  } catch (error) {
    console.error('[Auth Middleware]', error);
    res.status(500).json({ error: 'Błąd uwierzytelniania' });
  }
};

const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Użytkownik nie uwierzytelniony' });
    }

    if (req.user.role !== requiredRole && req.user.role !== 'administrator') {
      return res.status(403).json({ 
        error: `Dostęp tylko dla użytkowników z rolą: ${requiredRole}` 
      });
    }

    next();
  };
};

const requireInstructor = requireRole('instruktor');
const requireAdmin = requireRole('administrator');

module.exports = {
  authenticateToken,
  requireRole,
  requireInstructor,
  requireAdmin
}; 
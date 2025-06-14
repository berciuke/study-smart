const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu JWT' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy token JWT' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
}; 
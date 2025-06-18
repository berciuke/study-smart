const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Brak tokena, autoryzacja odrzucona' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'najlepiej_dlugi_i_losowy', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token jest nieprawidłowy' });
        }
        req.user = user;
        next();
    });
};

module.exports = authMiddleware; 
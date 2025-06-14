require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection, sequelize } = require('./config/db');
const userRoutes = require('./routes/user.routes');

const app = express();

// Bezpieczeństwo
app.use(helmet());
app.use(cors());
app.use(express.json());
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
});
app.use(limiter);

// Podpięcie tras 
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Błąd serwera',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Zgłoś błąd do administratora'
  });
});

const PORT = process.env.USER_SERVICE_PORT || 3001;

const start = async () => {
  try {
    await testConnection();
    
    await sequelize.sync();
    
    app.listen(PORT, () => {
      console.log(`[User Service] działa na porcie ${PORT}`);
    });
  } catch (error) {
    console.error('[User Service] ERROR:', error);
    process.exit(1);
  }
};

start(); 
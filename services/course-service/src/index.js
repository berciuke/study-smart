require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testConnection, sequelize } = require('./config/db');
const courseRoutes = require('./routes/course.routes');

// Import all models to ensure proper initialization
require('./models');

const app = express();

// Bezpieczeństwo
app.use(helmet());
app.use(cors());
app.use(express.json());
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
});
app.use(limiter);

// Podpięcie tras 
app.use('/api/courses', courseRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Błąd serwera',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Zgłoś błąd do administratora'
  });
});

const PORT = process.env.COURSE_SERVICE_PORT || 3002;

const start = async () => {
  try {
    await testConnection();
    
    await sequelize.sync();
    
    app.listen(PORT, () => {
      console.log(`[Course Service] działa na porcie ${PORT}`);
    });
  } catch (error) {
    console.error('[Course Service] ERROR:', error);
    process.exit(1);
  }
};

start(); 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection, checkDatabaseHealth, prisma } = require('./config/db');
const userRoutes = require('./routes/user.routes');

const app = express();

// Bezpieczeństwo
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
}));

app.use(express.json());
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
});
app.use(limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealthy = await checkDatabaseHealth();
    res.status(dbHealthy ? 200 : 503).json({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'user-service'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      service: 'user-service'
    });
  }
});

// Readiness check endpoint
app.get('/readiness', async (req, res) => {
  try {
    const dbReady = await checkDatabaseHealth();
    if (dbReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

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
    console.log('🚀 Uruchamianie User Service...');
    
    // Test connection to database
    await testConnection();
    
    // Generate Prisma Client (in case of first run)
    console.log('🔄 Generowanie Prisma Client...');
    
    app.listen(PORT, () => {
      console.log(`[User Service] działa na porcie ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`🔍 Readiness check: http://localhost:${PORT}/readiness`);
    });
  } catch (error) {
    console.error('[User Service] ERROR:', error);
    process.exit(1);
  }
};

start(); 
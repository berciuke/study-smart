const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const progressRoutes = require('./routes/progress.routes');

const app = express();
const PORT = process.env.PROGRESS_SERVICE_PORT || 3003;

connectDB();

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Za dużo requestów z tego IP'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Progress-Service',
    timestamp: new Date().toISOString(),
    database: 'MongoDB',
    version: '1.0.0'
  });
});

app.use('/api/progress', progressRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint nie został znaleziony' });
});

app.use((error, req, res, next) => {
  console.error('[Global Error Handler]', error);
  res.status(500).json({ 
    error: 'Wewnętrzny błąd serwera',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

app.listen(PORT, () => {
  console.log(`PROGRESS-SERVICE działa na porcie ${PORT}`);
  console.log(`MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/study_smart'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app; 
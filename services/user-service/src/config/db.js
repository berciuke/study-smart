const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Singleton pattern with hot-reload safety
const globalForPrisma = global;

// Environment-specific logging configuration
const logConfig = process.env.NODE_ENV === 'production'
  ? [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' }
    ]
  : [
      { emit: 'stdout', level: 'query' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
      { emit: 'event', level: 'error' }
    ];

// Create Prisma client with production-ready configuration
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: logConfig,
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  // Production error event handling
  if (process.env.NODE_ENV === 'production') {
    client.$on('error', (e) => {
      console.error('Prisma client error:', e);
    });

    client.$on('warn', (e) => {
      console.warn('Prisma client warning:', e);
    });
  }

  return client;
};

// Singleton instance with hot-reload safety
const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection test with retry logic
const testConnection = async () => {
  const maxRetries = Number(process.env.DB_CONNECT_RETRIES) || 3;
  const retryDelay = Number(process.env.DB_CONNECT_DELAY_MS) || 2000;

  for (let retries = maxRetries; retries > 0; retries--) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ POŁĄCZONO z PostgreSQL (Prisma)');
      return true;
    } catch (error) {
      console.warn(`⚠️ Błąd połączenia z bazą danych, pozostało prób: ${retries - 1}`, error.message);
      
      if (retries > 1) {
        console.log(`🔄 Ponowna próba za ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('❌ ERROR POŁĄCZENIA z PostgreSQL:', error);
        throw error;
      }
    }
  }
};

// Health check function for readiness endpoints
const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Graceful shutdown handler
const gracefulShutdown = async () => {
  try {
    console.log('🔄 Rozpoczynam graceful shutdown Prisma...');
    await prisma.$disconnect();
    console.log('✅ Prisma gracefully disconnected');
  } catch (error) {
    console.error('❌ Błąd podczas graceful shutdown:', error);
  }
};

// Signal handlers for graceful shutdown
let shutdownInProgress = false;
const handleShutdown = async (signal) => {
  if (shutdownInProgress) return;
  shutdownInProgress = true;
  
  console.log(`📡 Otrzymano sygnał ${signal}, rozpoczynam graceful shutdown...`);
  await gracefulShutdown();
  process.exit(0);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGQUIT', () => handleShutdown('SIGQUIT'));

// Unhandled error handling
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  await gracefulShutdown();
  process.exit(1);
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await gracefulShutdown();
  process.exit(1);
});

module.exports = {
  prisma,
  testConnection,
  checkDatabaseHealth,
  gracefulShutdown
}; 
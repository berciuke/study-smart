require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { testConnection, sequelize } = require("./config/db");
const courseRoutes = require("./routes/course.routes");
const resourceRoutes = require("./routes/resource.routes");

// Import all models to ensure proper initialization
const models = require("./models");

const app = express();

// Bezpieczeństwo
app.use(helmet());
app.use(cors());
app.use(express.json());
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
});
app.use(limiter);

// Podpięcie tras
app.use("/api/courses", courseRoutes);
app.use("/api", resourceRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "course-service",
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Błąd serwera",
    details:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Zgłoś błąd do administratora",
  });
});

const PORT = process.env.COURSE_SERVICE_PORT || 3002;

const start = async () => {
  try {
    await testConnection();

    // Synchronize models in correct order
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // Wait for tables to be created
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`[Course Service] działa na porcie ${PORT}`);
    });
  } catch (error) {
    console.error("[Course Service] ERROR:", error);
    process.exit(1);
  }
};

start();

const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const initPassport = require('./config/passport');
const passport = initPassport();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Security headers
app.use(helmet());

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Input sanitization
app.use(mongoSanitize()); // prevent NoSQL injection
app.use(xss());           // prevent XSS

// Passport (no sessions — JWT only)
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Unhandled routes
app.all('/{*path}', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;

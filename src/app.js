const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // 100 requests per hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body. 50mb limit for images/payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (disabled because it escapes all rich text HTML)
// Consider using DOMPurify in the future if strict HTML sanitization is needed
// app.use(xss());

// Implement CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or if origin is in allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to allow during development
    }
  },
  credentials: true
}));

// Handle OPTIONS requests (preflight) properly for Express 5
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// 2) ROUTES
const authRouter = require('./routes/authRoutes');
const postRouter = require('./routes/postRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const mediaRouter = require('./routes/mediaRoutes');
const contactRouter = require('./routes/contactRoutes');
const subscriberRouter = require('./routes/subscriberRoutes');
const commentRouter = require('./routes/commentRoutes');
const pageRouter = require('./routes/pageRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/subscribers', subscriberRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/pages', pageRouter);
app.use('/api/v1/dashboard', dashboardRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Borderless Afro Legal Hub API'
  });
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const eventRoutes = require('./routes/event.route');
const adminRoutes = require('./routes/admin.route');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('Running in development mode with missing variables - this may cause errors');
  }
}

// Environment variables with defaults
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/admin-portal';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Enhanced middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "http://localhost:3000", "https://*"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [CLIENT_URL];
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Ensure public/images directory exists
const imagesDir = path.join(__dirname, 'public/images');
try {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('Created images directory:', imagesDir);
  }
} catch (err) {
  console.error('Failed to create images directory:', err);
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

// Static files
app.use('/images', express.static(imagesDir, {
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=31536000');
  },
  fallthrough: false
}));

// API routes
app.use('/api/events', eventRoutes);
app.use('/api/admins', adminRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({ 
      status: 'healthy',
      database: dbStatus,
      server: 'running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Database connection
mongoose.set('debug', process.env.NODE_ENV === 'development');

const connectWithRetry = (retries = 5, delay = 5000) => {
  console.log(`Attempting MongoDB connection (${retries} retries left)...`);
  
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    w: 'majority'
  })
  .then(() => {
    console.log('Successfully connected to MongoDB');
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    
    if (retries > 0) {
      console.log(`Retrying connection in ${delay/1000} seconds...`);
      setTimeout(() => connectWithRetry(retries - 1, delay), delay);
    } else {
      console.error('Maximum retries reached. Exiting...');
      if (process.env.NODE_ENV === 'production') process.exit(1);
    }
  });
};

connectWithRetry();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Server startup
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received: shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown('uncaughtException');
});
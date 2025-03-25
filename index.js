require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const eventRoutes = require('./routes/event.route');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

// Environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:bigidea123@bigideadb.xeleu.mongodb.net/BigideaDB?retryWrites=true&w=majority&appName=BigideaDB';

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Static files
app.use('/images', express.static(path.join(__dirname, 'public/images'),
{
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes - Updated to /api/events for better REST convention
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Database connection with improved options
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('Successfully connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Events API: http://localhost:${PORT}/api/events`);
  });
})
.catch((err) => {
  console.error('Database connection error:', err.message);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});
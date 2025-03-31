// routes/event.route.js
const express = require('express');
const router = express.Router();
const { 
  postEvent, 
  getAllEvents, 
  deleteEvent,
  updateEvent 
} = require('../controllers/event.controller');
const upload = require('../middleware/multer');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post('/', authMiddleware, upload.single("image"), postEvent);
router.patch('/:id', authMiddleware, upload.single("image"), updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

// Public route
router.get('/', getAllEvents);

module.exports = router;
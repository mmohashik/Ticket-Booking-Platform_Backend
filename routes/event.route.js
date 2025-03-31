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

// Add authentication to event management routes
router.post('/', authMiddleware, upload.single("image"), postEvent);
router.patch('/:id', authMiddleware, upload.single("image"), updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

// Public route for getting events
router.get('/', getAllEvents);

module.exports = router;
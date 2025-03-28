const express = require('express');
const router = express.Router();
const { 
  postEvent, 
  getAllEvents, 
  deleteEvent,
  updateEvent 
} = require('../controllers/event.controller');
const upload = require('../middleware/multer');

// POST - Create new event (with image upload)
router.post('/', upload.single("image"), postEvent);

// GET - Get all events
router.get('/', getAllEvents);

// DELETE - Delete an event by ID
router.delete('/:id', deleteEvent);

// PATCH - Update an event by ID (with optional image upload)
router.patch('/:id', upload.single("image"), updateEvent);
// Alternatively for PUT:
// router.put('/:id', upload.single("image"), updateEvent);

module.exports = router;


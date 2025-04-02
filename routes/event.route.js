const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const upload = require('../middleware/multer');

router.post('/', upload.single('image'), eventController.createEvent);

// GET /api/events - Get all events
router.get('/', eventController.getAllEvents);

// GET /api/events/:id - Get single event
router.get('/:id', eventController.getEvent);

// PUT /api/events/:id - Update event
router.put('/:id', eventController.updateEvent);

// DELETE /api/events/:id - Delete event
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
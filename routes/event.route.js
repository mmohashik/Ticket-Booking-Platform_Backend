const express = require('express');
const router = express.Router();
const Event = require('../models/event.model');
const { postEvent, getAllEvents, deleteEvent } = require('../controllers/event.controller');
const upload = require('../middleware/multer');

router.post('/', upload.single("image"), postEvent);

// GET - Get all events
router.get('/', getAllEvents);

// DELETE - Delete an event by ID
router.delete('/:id', deleteEvent);

module.exports = router;


// routes/event.route.js

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const upload = require('../middleware/multer');
const fs = require('fs');
const path = require('path');

// Serve images
router.get('/images/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../public/images', req.params.filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      status: 'error',
      message: 'Image not found'
    });
  }
});

// Event routes
router.post('/', upload.single('image'), eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);
router.put('/:id', upload.single('image'), eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

//  Seat booking route
router.post('/book-seat', eventController.bookSeat);

module.exports = router;

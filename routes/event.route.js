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

// Get all bookings route - MOVED UP
router.get('/bookings', eventController.getAllBookings);

// Get total unique users count
router.get('/bookings/users/count', eventController.getTotalUsers);

router.get('/:id', eventController.getEvent);
router.put('/:id', upload.single('image'), eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

// Route to get event report
router.get('/:id/report', eventController.getEventReport);

// Booking creation route (replaces old seat booking route)
router.post('/create-booking', eventController.createBooking);


module.exports = router;

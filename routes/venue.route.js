const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venue.controller');

router.post('/', venueController.createVenue);
router.get('/', venueController.getAllVenues);
router.get('/:venueId/event/:eventId', venueController.getVenueWithPricing);
router.get('/:id', venueController.getVenue);
router.put('/:id', venueController.updateVenue);
router.delete('/:id', venueController.deleteVenue);
router.post('/preview', venueController.generateSVGPreview);

module.exports = router;
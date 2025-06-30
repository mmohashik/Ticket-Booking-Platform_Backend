// controllers/event.controller.js

const Event = require('../models/event.model');
const path = require('path');
const fs = require('fs');

const eventController = {
  // Get all events
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.find().sort({ createdAt: -1 });

      const eventsWithFullImageUrls = events.map(event => ({
        ...event._doc,
        image: event.image ? `${req.protocol}://${req.get('host')}${event.image}` : null
      }));

      res.status(200).json({
        status: 'success',
        data: eventsWithFullImageUrls,
        count: events.length
      });
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch events',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Create new event
  createEvent: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Event image is required" });
      }

      const eventData = {
        eventName: req.body.eventName,
        eventDescription: req.body.eventDescription,
        eventDate: req.body.eventDate,
        eventTime: req.body.eventTime,
        venue: req.body.venue,
        totalTickets: req.body.totalTickets,
        status: req.body.status || "Upcoming",
        image: `/images/${req.file.filename}`
      };

      if (req.body.ticketTypes) {
        eventData.ticketTypes = typeof req.body.ticketTypes === 'string'
          ? JSON.parse(req.body.ticketTypes)
          : req.body.ticketTypes;
      }

      //  Add seat handling
      if (req.body.seats) {
        try {
          eventData.seats = typeof req.body.seats === 'string'
            ? JSON.parse(req.body.seats)
            : req.body.seats;
        } catch (e) {
          return res.status(400).json({ error: 'Invalid seat data format' });
        }
      }

      const newEvent = new Event(eventData);
      const savedEvent = await newEvent.save();

      res.status(201).json(savedEvent);
    } catch (err) {
      if (req.file) {
        fs.unlink(path.join(__dirname, '../public', req.file.path), (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      res.status(500).json({ error: err.message });
    }
  },

  // Get single event
  getEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          status: 'error',
          message: 'Event not found'
        });
      }

      const eventWithFullImageUrl = {
        ...event._doc,
        image: event.image ? `${req.protocol}://${req.get('host')}${event.image}` : null
      };

      res.status(200).json({
        status: 'success',
        data: eventWithFullImageUrl
      });
    } catch (err) {
      console.error('Error fetching event:', err);

      if (err.name === 'CastError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid event ID format'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch event',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Update event
  updateEvent: async (req, res) => {
    try {
      const eventId = req.params.id;
      let updates = {};

      if (req.body.eventName) updates.eventName = req.body.eventName;
      if (req.body.eventDescription) updates.eventDescription = req.body.eventDescription;
      if (req.body.eventDate) updates.eventDate = req.body.eventDate;
      if (req.body.eventTime) updates.eventTime = req.body.eventTime;
      if (req.body.venue) updates.venue = req.body.venue;
      if (req.body.totalTickets) updates.totalTickets = req.body.totalTickets;
      if (req.body.status) updates.status = req.body.status;

      if (req.body.ticketTypes) {
        try {
          updates.ticketTypes = typeof req.body.ticketTypes === 'string'
            ? JSON.parse(req.body.ticketTypes)
            : req.body.ticketTypes;
        } catch (e) {
          return res.status(400).json({ message: 'Invalid ticketTypes format' });
        }
      }

      // 🆕 Handle seat updates
      if (req.body.seats) {
        try {
          updates.seats = typeof req.body.seats === 'string'
            ? JSON.parse(req.body.seats)
            : req.body.seats;
        } catch (e) {
          return res.status(400).json({ message: 'Invalid seats format' });
        }
      }

      if (req.file) {
        const newImagePath = `/images/${req.file.filename}`;
        const oldEvent = await Event.findById(eventId);
        const oldImagePath = oldEvent?.image;
        updates.image = newImagePath;

        if (oldImagePath) {
          const fullOldPath = path.join(__dirname, '../public', oldImagePath);
          if (fs.existsSync(fullOldPath)) {
            fs.unlinkSync(fullOldPath);
          }
        }
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedEvent) {
        if (req.file) {
          fs.unlinkSync(path.join(__dirname, '../public/images', req.file.filename));
        }
        return res.status(404).json({ message: 'Event not found' });
      }

      res.status(200).json(updatedEvent);
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(path.join(__dirname, '../public/images', req.file.filename));
      }

      console.error('Error updating event:', error);
      res.status(500).json({
        message: 'Failed to update event',
        error: error.message
      });
    }
  },

  // Delete event
  deleteEvent: async (req, res) => {
    try {
      const deletedEvent = await Event.findByIdAndDelete(req.params.id);

      if (!deletedEvent) {
        return res.status(404).json({
          status: 'error',
          message: 'Event not found'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Event deleted successfully',
        data: {
          id: deletedEvent._id,
          title: deletedEvent.title
        }
      });
    } catch (err) {
      console.error('Error deleting event:', err);

      if (err.name === 'CastError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid event ID format'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to delete event',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // 🆕 Book a seat
  bookSeat: async (req, res) => {
    const { eventId, seatId } = req.body;

    try {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      const seat = event.seats.find(s => s.id === seatId);
      if (!seat) return res.status(404).json({ message: 'Seat not found' });

      if (seat.isBooked) return res.status(400).json({ message: 'Seat already booked' });

      seat.isBooked = true;
      await event.save();

      res.status(200).json({ message: 'Seat booked successfully', seat });
    } catch (error) {
      console.error('Booking error:', error);
      res.status(500).json({ message: 'Booking failed', error: error.message });
    }
  }
};

module.exports = eventController;

const Event = require('../models/event.model');
const path = require('path');
const fs = require('fs');

const eventController = {
  // Get all events
getAllEvents: async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    
    // Add full image URLs to each event
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
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "Event image is required" });
      }
  
      // Prepare event data
      const eventData = {
        eventName: req.body.eventName,
        eventDescription: req.body.eventDescription,
        eventDate: req.body.eventDate,
        eventTime: req.body.eventTime,
        venue: req.body.venue,
        totalTickets: req.body.totalTickets,
        status: req.body.status || "Upcoming",
        image: `/images/${req.file.filename}`, // This is the path that will be saved in DB
      };
  
      // Handle ticket types
      if (req.body.ticketTypes && typeof req.body.ticketTypes === 'string') {
        eventData.ticketTypes = JSON.parse(req.body.ticketTypes);
      } else if (req.body.ticketTypes) {
        eventData.ticketTypes = req.body.ticketTypes;
      }
  
      // Create and save the event
      const newEvent = new Event(eventData);
      const savedEvent = await newEvent.save();
  
      res.status(201).json(savedEvent);
    } catch (err) {
      // Delete the uploaded file if error occurs
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

    // Create a proper image URL
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
      const { title, description, date, location, image } = req.body;

      // Validate date if provided
      if (date && isNaN(new Date(date))) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format'
        });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      // If date is being updated, convert to Date object
      if (date) {
        updateData.date = new Date(date);
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        updateData,
        { 
          new: true,
          runValidators: true 
        }
      );

      if (!updatedEvent) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Event not found' 
        });
      }

      res.status(200).json({
        status: 'success',
        data: updatedEvent,
        message: 'Event updated successfully'
      });

    } catch (err) {
      console.error('Error updating event:', err);
      
      // Handle duplicate key errors
      if (err.code === 11000) {
        return res.status(400).json({
          status: 'error',
          message: 'Event with this title already exists'
        });
      }

      // Handle validation errors
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors
        });
      }

      if (err.name === 'CastError') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid event ID format'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to update event',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
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
  }
};

module.exports = eventController;
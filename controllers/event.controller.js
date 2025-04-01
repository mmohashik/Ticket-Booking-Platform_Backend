const Event = require('../models/event.model');

const eventController = {
  // Get all events
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.find().sort({ createdAt: -1 });
      res.status(200).json({ 
        status: 'success', 
        data: events,
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

  createEvent: async (req, res) => {
    try {
      const { 
        eventName, 
        eventDescription, 
        eventDate, 
        eventTime, 
        venue, 
        totalTickets, 
        ticketTypes, 
        image,
        status 
      } = req.body;
  
      // Validate required fields
      if (!eventName || !eventDate || !eventTime || !venue || !totalTickets || !image) {
        return res.status(400).json({
          status: 'error',
          message: 'eventName, eventDate, eventTime, venue, totalTickets, and image are required fields'
        });
      }
  
      // Validate date format
      if (isNaN(new Date(eventDate))) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format'
        });
      }
  
      // Validate ticket types if provided
      if (ticketTypes && Array.isArray(ticketTypes)) {
        for (const ticketType of ticketTypes) {
          if (!ticketType.type || !ticketType.price) {
            return res.status(400).json({
              status: 'error',
              message: 'Each ticket type must have both type and price fields'
            });
          }
          if (isNaN(ticketType.price)) {
            return res.status(400).json({
              status: 'error',
              message: 'Ticket price must be a number'
            });
          }
        }
      }
  
      // Create new event
      const newEvent = new Event({
        eventName,
        eventDescription: eventDescription || '',
        eventDate: new Date(eventDate),
        eventTime,
        venue,
        totalTickets: Number(totalTickets),
        ticketTypes: ticketTypes || [],
        image,
        status: status || 'Upcoming'
      });
  
      // Save to database
      const savedEvent = await newEvent.save();
  
      res.status(201).json({
        status: 'success',
        data: savedEvent,
        message: 'Event created successfully'
      });
  
    } catch (err) {
      console.error('Error creating event:', err);
      
      // Handle duplicate key errors
      if (err.code === 11000) {
        return res.status(400).json({
          status: 'error',
          message: 'Event with this name already exists'
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
  
      res.status(500).json({
        status: 'error',
        message: 'Failed to create event',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
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
      
      res.status(200).json({ 
        status: 'success', 
        data: event 
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
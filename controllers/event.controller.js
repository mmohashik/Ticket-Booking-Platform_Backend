const Event = require("../models/event.model");
const fs = require('fs');
const path = require('path');

// Helper function to delete image file
const deleteImage = (imagePath) => {
  try {
    if (!imagePath) return;
    
    // Extract filename from path
    const filename = imagePath.split('/').pop();
    const filePath = path.join(__dirname, '../public/images', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted image: ${filename}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

const eventController = {
  // Create new event
  postEvent: async (req, res) => {
    try {
      const { eventName, eventDescription, eventDate, eventTime, venue, totalTickets, ticketTypes } = req.body;
      
      // Validate image upload
      if (!req.file) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Event image is required' 
        });
      }
      
      // Set image path
      const imagePath = `/images/${req.file.filename}`;
      
      // Parse ticket types if provided as string
      let parsedTicketTypes;
      try {
        parsedTicketTypes = typeof ticketTypes === 'string' 
          ? JSON.parse(ticketTypes) 
          : ticketTypes;
      } catch (error) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Invalid ticketTypes format' 
        });
      }
      
      // Create new event
      const newEvent = new Event({
        eventName,
        eventDescription,
        eventDate,
        eventTime,
        venue,
        totalTickets,
        ticketTypes: parsedTicketTypes,
        image: imagePath,
      });
  
      await newEvent.save();
      
      res.status(201).json({
        status: 'success',
        data: { event: newEvent }
      });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error creating event", 
        error: error.message 
      });
    }
  },

  // In event.controller.js
getAllEvents: async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events); // Just return the array directly
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ 
      status: 'error',
      message: "Error fetching events", 
      error: error.message 
    });
  }
},

  // Delete event
  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params;
      
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ 
          status: 'error',
          message: "Event not found" 
        });
      }
      
      // Delete image file if it exists
      if (event.image) {
        deleteImage(event.image);
      }
      
      // Delete event from database
      await Event.findByIdAndDelete(id);
      
      res.status(200).json({ 
        status: 'success',
        message: "Event deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error deleting event", 
        error: error.message 
      });
    }
  },

  // Update event
  updateEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const { eventName, eventDescription, eventDate, eventTime, venue, totalTickets, ticketTypes } = req.body;
      
      // Find existing event
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({ 
          status: 'error',
          message: "Event not found" 
        });
      }
  
      // Handle image upload
      let imagePath = existingEvent.image;
      if (req.file) {
        // Delete old image
        deleteImage(existingEvent.image);
        // Set new image path
        imagePath = `/images/${req.file.filename}`;
      }
  
      // Parse ticket types if provided as string
      let parsedTicketTypes;
      if (ticketTypes) {
        try {
          parsedTicketTypes = typeof ticketTypes === 'string' 
            ? JSON.parse(ticketTypes) 
            : ticketTypes;
        } catch (error) {
          return res.status(400).json({ 
            status: 'error',
            message: 'Invalid ticketTypes format' 
          });
        }
      }
  
      // Update event
      const updatedEvent = await Event.findByIdAndUpdate(
        id,
        {
          eventName: eventName || existingEvent.eventName,
          eventDescription: eventDescription || existingEvent.eventDescription,
          eventDate: eventDate || existingEvent.eventDate,
          eventTime: eventTime || existingEvent.eventTime,
          venue: venue || existingEvent.venue,
          totalTickets: totalTickets || existingEvent.totalTickets,
          ticketTypes: parsedTicketTypes || existingEvent.ticketTypes,
          image: imagePath,
        },
        { new: true, runValidators: true }
      );
  
      res.status(200).json({
        status: 'success',
        data: { event: updatedEvent }
      });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ 
        status: 'error',
        message: "Error updating event", 
        error: error.message 
      });
    }
  },
};

module.exports = eventController;
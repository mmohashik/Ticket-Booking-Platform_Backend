const Event = require("../models/event.model");

const postEvent = async (req, res) => {
  try {
    const { eventName, eventDescription, eventDate, eventTime, venue, totalTickets, ticketTypes } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    const newEvent = new Event({
      eventName,
      eventDescription,
      eventDate,
      eventTime,
      venue,
      totalTickets,
      ticketTypes: JSON.parse(ticketTypes),
      image: imagePath,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Error creating event", error });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(200).json({ message: "Event deleted successfully", deletedEvent });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event", error });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { eventName, eventDescription, eventDate, eventTime, venue, totalTickets, ticketTypes } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : existingEvent.image;

    // Parse ticketTypes if provided
    let parsedTicketTypes;
    if (ticketTypes !== undefined) {
      try {
        parsedTicketTypes = JSON.parse(ticketTypes);
      } catch (error) {
        return res.status(400).json({ message: "Invalid ticketTypes format" });
      }
    }

    const updateData = {
      eventName: eventName !== undefined ? eventName : existingEvent.eventName,
      eventDescription: eventDescription !== undefined ? eventDescription : existingEvent.eventDescription,
      eventDate: eventDate !== undefined ? eventDate : existingEvent.eventDate,
      eventTime: eventTime !== undefined ? eventTime : existingEvent.eventTime,
      venue: venue !== undefined ? venue : existingEvent.venue,
      totalTickets: totalTickets !== undefined ? totalTickets : existingEvent.totalTickets,
      ticketTypes: parsedTicketTypes !== undefined ? parsedTicketTypes : existingEvent.ticketTypes,
      image: imagePath,
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Delete old image if a new one is uploaded
    if (req.file && existingEvent.image) {
      deleteImage(existingEvent.image);
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error });
  }
};

module.exports = { postEvent, getAllEvents, deleteEvent, updateEvent };
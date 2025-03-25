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

module.exports = { postEvent, getAllEvents, deleteEvent };
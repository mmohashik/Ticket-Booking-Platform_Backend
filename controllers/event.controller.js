const Event = require("../models/event.model");

const postEvent = async (req, res) => {
  try {
    const { eventName, eventDate, eventTime, venue, ticketTypes } = req.body;
    const imagePath = req.file ? `/images/${req.file.filename}` : null;

    const newEvent = new Event({
      eventName,
      eventDate,
      eventTime,
      venue,
      ticketTypes: JSON.parse(ticketTypes), // Parse the stringified array
      image: imagePath,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Error creating event", error });
  }
};

module.exports = { postEvent };

const Event = require("../models/event.model");

const postEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { postEvent };

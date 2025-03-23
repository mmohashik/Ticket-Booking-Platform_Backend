const mongoose = require("mongoose");

const TicketTypeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  price: { type: Number, required: true },
});

const EventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true },
  venue: { type: String, required: true },
  ticketTypes: [TicketTypeSchema],
  image: { type: String, required: true },
  status: { type: String, enum: ["Upcoming", "Ongoing", "Completed"], default: "Upcoming" },
});

module.exports = mongoose.model("Event", EventSchema);
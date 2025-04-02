const mongoose = require("mongoose");

const TicketTypeSchema = new mongoose.Schema({
  type: String,
  price: Number
});

const EventSchema = new mongoose.Schema({
  eventName: String,
  eventDescription: String,
  eventDate: Date,
  eventTime: String,
  venue: String,
  totalTickets: Number,
  ticketTypes: [TicketTypeSchema],
  image: String,
  status: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Event", EventSchema);
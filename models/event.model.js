// models/event.model.js

const mongoose = require("mongoose");

const TicketTypeSchema = new mongoose.Schema({
  type: String,
  price: Number
});

// Seat Schema
const SeatSchema = new mongoose.Schema({
  id: String,       // e.g., A1, B2
  x: Number,        // Position X
  y: Number,        // Position Y
  isBooked: { type: Boolean, default: false }
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
  seats: [SeatSchema], // 🆕 Add seats
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Event", EventSchema);

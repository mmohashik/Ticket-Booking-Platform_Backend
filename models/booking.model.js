// models/booking.model.js

const mongoose = require("mongoose");

const BookedSeatSchema = new mongoose.Schema({
  seatId: { type: String, required: true }, // e.g., "A1", "B2"
  // You could add price paid for this specific seat if needed in the future
  // price: { type: Number, required: true } 
});

const BookingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  seats: [BookedSeatSchema], // Array of selected seat IDs/objects
  ticketHolderName: {
    type: String,
    required: true,
    trim: true,
  },
  ticketHolderEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  ticketHolderPhone: {
    type: String,
    required: true,
    trim: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentId: {
    // Stripe PaymentIntent ID
    type: String,
    required: true,
    unique: true, // Ensures each payment intent is only recorded once
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  status: { // Optional: For future use e.g., 'confirmed', 'cancelled'
    type: String,
    default: 'confirmed', 
    enum: ['confirmed', 'pending', 'cancelled']
  }
});

// Indexing for quicker queries on event bookings or user bookings (by email)
BookingSchema.index({ eventId: 1 });
BookingSchema.index({ ticketHolderEmail: 1 });

module.exports = mongoose.model("Booking", BookingSchema);

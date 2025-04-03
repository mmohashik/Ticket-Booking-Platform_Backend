const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  layoutType: { 
    type: String, 
    enum: ['auditorium', 'theater', 'stadium', 'conference', 'custom'],
    default: 'auditorium'
  },
  totalSeats: Number,
  seatMap: {
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    aisleAfterCol: { type: Number }, // Column number after which aisle appears
    categories: [{
      name: { type: String, required: true, enum: ['General', 'VIP', 'VVIP'] },
      color: { type: String, required: true },
      rowCount: { type: Number } // Number of rows for this category
    }],
    unavailableSeats: [String]
  },
  svgTemplate: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venue', venueSchema);
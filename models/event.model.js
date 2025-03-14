const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    eventname: {
      type: String,
      required: true,
    },
    
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Event', EventSchema);

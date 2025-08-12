// models/Travel.js
const mongoose = require('mongoose'); // Add this import at the top

const travelSchema = new mongoose.Schema({
  agency: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agency',
    required: true 
  },
  busNumber: { 
    type: String, 
    required: true 
  },
  departure: {
    location: { 
      type: String, 
      required: true 
    },
    time: { 
      type: Date, 
      required: true 
    }
  },
  arrival: {
    location: { 
      type: String, 
      required: true 
    },
    time: { 
      type: Date, 
      required: true 
    }
  },
  availableSeats: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ['scheduled', 'boarding', 'departed', 'arrived', 'cancelled'],
    default: 'scheduled'
  }
});

module.exports = mongoose.model('Travel', travelSchema);
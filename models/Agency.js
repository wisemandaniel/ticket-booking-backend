const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    uppercase: true,
    match: [/^[A-Z0-9]+$/, 'Seat number can only contain letters and numbers']
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const busSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Bus must have a number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    required: true,
    enum: ['30-seater', '56-seater', '70-seater']
  },
  seats: [seatSchema], // Track individual seat availability
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const agencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  buses: [busSchema],
  contactEmail: String,
  contactPhone: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
agencySchema.index({ 'buses.number': 1 }, { unique: true });
agencySchema.index({ 'buses.seats.number': 1, 'buses._id': 1 }, { unique: true });

const Agency = mongoose.model('Agency', agencySchema);
module.exports = Agency;
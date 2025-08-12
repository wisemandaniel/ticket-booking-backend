const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  kickoffLocation: {
    type: String,
    required: [true, 'Kickoff location is required']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required']
  },
  agency: {
    name: { 
      type: String, 
      required: true,
      index: true 
    },
    busNumber: { 
      type: String, 
      required: true,
      index: true 
    },
    busType: {
      type: String,
      enum: ['30-seater', '56-seater', '70-seater'],
      required: true
    }
  },
  seats: [{
    seatNumber: { 
      type: Number,
      required: true,
      min: [1, 'Seat number must be at least 1'],
      max: [70, 'Seat number cannot exceed 70']
    },
    passengerName: { type: String, required: true },
    passengerContact: { type: String, required: true }
  }],
  travelDate: {
    type: Date,
    required: true,
    index: true
  },
  bookingPrice: {
    type: Number,
    required: [true, 'Booking price is required']
  },
  serviceFee: {
    type: Number,
    required: [true, 'Service fee is required']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  payment: {
    method: { 
      type: String, 
      enum: ['momo', 'cash'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'], 
      default: 'pending' 
    },
    momoNumber: { 
      type: String,
      required: function() { return this.payment.method === 'momo'; }
    },
    transactionId: { type: String }
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  bookingReference: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `B-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  }
}, { timestamps: true });

// Compound index to prevent duplicate seat bookings
bookingSchema.index(
  { 
    'agency.name': 1,
    'agency.busNumber': 1,
    'travelDate': 1,
    'seats.seatNumber': 1
  }, 
  { 
    unique: true,
    partialFilterExpression: {
      status: { $ne: 'cancelled' }
    }
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
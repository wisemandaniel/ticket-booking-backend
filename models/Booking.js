const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bookingReference: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 6);
      const agencyInitials = this.agency ? this.agency.substring(0, 3).toUpperCase() : 'BUS';
      return `${agencyInitials}-${timestamp}-${randomStr}`;
    }
  },
  agency: { type: String, required: true },
  kickoff_location: { type: String, required: true },
  destination: { type: String, required: true },
  busType: { type: String, required: true },
  seats: { type: [String], required: true }, // Changed to String to match frontend
  passengers: [{
    name: { type: String, required: true },
    idNumber: { type: String, required: true }
  }],
  totalAmount: { type: Number, required: true },
  serviceFee: { type: Number, required: true },
  paymentMethod: { type: String, required: true, enum: ['cash', 'momo'] },
  momoNumber: { 
    type: String, 
    required: function() { return this.paymentMethod === 'momo'; } 
  },
  travelDate: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  status: { 
    type: String, 
    default: 'confirmed', 
    enum: ['confirmed', 'cancelled', 'completed'] 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted route
bookingSchema.virtual('route').get(function() {
  return `${this.kickoff_location} → ${this.destination}`;
});

// Validation
bookingSchema.pre('save', function(next) {
  if (this.seats.length !== this.passengers.length) {
    throw new Error('Number of seats must match number of passengers');
  }
  next();
});

// Indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ user: 1, travelDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
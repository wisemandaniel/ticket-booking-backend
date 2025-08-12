const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createBooking = catchAsync(async (req, res, next) => {
  const { agency, seats, travelDate } = req.body;

  // Validate required fields
  if (!agency || !seats || !travelDate) {
    return next(new AppError('Agency, seats, and travel date are required', 400));
  }

  // Convert and validate seat numbers
  const validatedSeats = seats.map(seat => {
    const seatNumber = Number(seat.seatNumber);
    if (isNaN(seatNumber)) {
      throw new AppError(`Invalid seat number: ${seat.seatNumber}`, 400);
    }
    return {
      ...seat,
      seatNumber
    };
  });

  // Check for duplicates in current request
  const seatNumbers = validatedSeats.map(s => s.seatNumber);
  if (new Set(seatNumbers).size !== seatNumbers.length) {
    return next(new AppError('Duplicate seat numbers in request', 400));
  }

  // Check for existing bookings
  const existingBookings = await Booking.find({
    'agency.name': agency.name,
    'agency.busNumber': agency.busNumber,
    travelDate,
    'seats.seatNumber': { $in: seatNumbers },
    status: { $ne: 'cancelled' }
  });

  if (existingBookings.length > 0) {
    const bookedSeats = existingBookings.flatMap(b => b.seats.map(s => s.seatNumber));
    const conflicts = seatNumbers.filter(num => bookedSeats.includes(num));
    return next(new AppError(
      `Seat(s) ${conflicts.join(', ')} already booked on ${agency.busNumber}`,
      400
    ));
  }

  // Create booking
  const booking = await Booking.create({
    ...req.body,
    user: req.user.id,
    seats: validatedSeats,
    bookingReference: generateBookingReference(),
    status: 'confirmed'
  });

  res.status(201).json({
    status: 'success',
    data: { booking }
  });
});

// Helper function
function generateBookingReference() {
  return `B-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

// Unified query method for all booking listings
const queryBookings = async (userId, filters, projection, sort) => {
  return await Booking.find({ 
    user: userId,
    ...filters
  })
  .select(projection)
  .sort(sort);
};

exports.getUserBookings = catchAsync(async (req, res, next) => {
  const bookings = await queryBookings(
    req.user.id,
    {},
    '-__v',
    '-createdAt'
  );
  
  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: { bookings }
  });
});

exports.getUserTravelHistory = catchAsync(async (req, res, next) => {
  const history = await queryBookings(
    req.user.id,
    { status: { $in: ['completed', 'cancelled'] } },
    'agency kickoffLocation destination createdAt seats status payment.status',
    '-createdAt'
  );
  
  res.status(200).json({
    status: 'success',
    results: history.length,
    data: { history }
  });
});

exports.getUpcomingBookings = catchAsync(async (req, res, next) => {
  const bookings = await queryBookings(
    req.user._id,
    { 
      status: 'confirmed',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    },
    'agency kickoffLocation destination createdAt seats status',
    'createdAt'
  );
  
  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: { bookings }
  });
});

exports.getUpcomingTrips = catchAsync(async (req, res, next) => {
  console.log('user ID', req.user._id);
  
  const trips = await Booking.find({
    user: req.user._id,
    status: 'confirmed',
    travelDate: { $gte: new Date() } // Changed from createdAt
  }).sort('travelDate');
  
  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: { trips }
  });
});

exports.getPastTrips = catchAsync(async (req, res, next) => {
  const trips = await queryBookings(
    req.user.id,
    { 
      status: 'completed',
      travelDate: { $lt: new Date() }
    },
    'agency kickoffLocation destination travelDate seats',
    '-travelDate'
  );
  
  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: { trips }
  });
});
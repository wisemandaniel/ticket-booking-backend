const Booking = require('../models/Booking');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    
    res.status(201).json({
      success: true,
      booking,
      paymentRequired: booking.paymentMethod === 'momo'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get user booking statistics
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    const [totalBookings, pastTrips, upcomingTrips] = await Promise.all([
      Booking.countDocuments({ user: userId, status: 'confirmed' }),
      Booking.countDocuments({ 
        user: userId, 
        status: 'completed',
        travelDate: { $lt: now }
      }),
      Booking.countDocuments({ 
        user: userId, 
        status: 'confirmed',
        travelDate: { $gte: now }
      })
    ]);

    res.status(200).json({
      success: true,
      stats: { totalBookings, pastTrips, upcomingTrips }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get user travel history
exports.getTravelHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    const history = await Booking.find({
      user: userId,
      status: { $in: ['completed', 'confirmed'] },
      travelDate: { $lt: now }
    })
    .sort('-travelDate')
    .select('agency kickoff_location destination seats totalAmount travelDate status');

    res.status(200).json({
      success: true,
      history: history.map(booking => ({
        id: booking._id,
        agency: booking.agency,
        route: booking.route, // Using virtual
        seats: booking.seats.length,
        totalAmount: booking.totalAmount,
        date: booking.travelDate,
        status: booking.status
      }))
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get upcoming trips
exports.getUpcomingTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    const upcoming = await Booking.find({
      user: userId,
      status: 'confirmed',
      travelDate: { $gte: now }
    })
    .sort('travelDate')
    .select('agency kickoff_location destination seats totalAmount travelDate');

    res.status(200).json({
      success: true,
      upcoming: upcoming.map(trip => ({
        id: trip._id,
        agency: trip.agency,
        route: trip.route,
        seats: trip.seats.length,
        totalAmount: trip.totalAmount,
        date: trip.travelDate
      }))
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};
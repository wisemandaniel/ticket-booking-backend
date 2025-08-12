// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.protect);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getUserBookings);


router.get('/history', bookingController.getUserTravelHistory);
router.get('/upcoming', bookingController.getUpcomingBookings);
router.get('/upcoming-trips', bookingController.getUpcomingTrips);
router.get('/past-trips', bookingController.getPastTrips);

module.exports = router;
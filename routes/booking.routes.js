const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.protect);

router.post('/', bookingController.createBooking);
router.get('/stats/:userId', bookingController.getUserStats);
router.get('/history/:userId', bookingController.getTravelHistory);
router.get('/upcoming/:userId', bookingController.getUpcomingTrips);

module.exports = router;
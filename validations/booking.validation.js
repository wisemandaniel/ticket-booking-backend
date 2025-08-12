const { body } = require('express-validator');

exports.createBookingValidation = [
  body('kickoffLocation').notEmpty().withMessage('Kickoff location required'),
  body('destination').notEmpty().withMessage('Destination required'),
  body('agency.name').notEmpty().withMessage('Agency name required'),
  body('agency.busNumber').notEmpty().withMessage('Bus number required'),
  body('agency.busType')
    .isIn(['30-seater', '56-seater', '70-seater'])
    .withMessage('Invalid bus type'),
  body('seats').isArray({ min: 1 }).withMessage('At least one seat required'),
  body('seats.*.seatNumber')
    .isInt({ min: 1 })
    .withMessage('Seat number must be a positive integer')
    .toInt(),
  body('seats.*.passengerName').notEmpty().withMessage('Passenger name required'),
  body('seats.*.passengerContact').notEmpty().withMessage('Contact required'),
  body('bookingPrice').isFloat({ gt: 0 }).withMessage('Invalid booking price'),
  body('serviceFee').isFloat({ min: 0 }).withMessage('Invalid service fee'),
  body('payment.method').isIn(['momo', 'cash']).withMessage('Invalid payment method'),
  body('payment.momoNumber')
    .if(body('payment.method').equals('momo'))
    .notEmpty()
    .withMessage('MoMo number required'),
  body('travelDate').isISO8601().withMessage('Invalid travel date')
];
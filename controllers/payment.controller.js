// controllers/payment.controller.js
const paymentService = require('../services/payment.service');
const catchAsync = require('../utils/catchAsync');

exports.handlePaymentWebhook = catchAsync(async (req, res) => {
  const { transactionId, status } = req.body;
  
  if (status === 'SUCCESSFUL') {
    await paymentService.verifyPayment(transactionId);
  }

  res.status(200).json({ received: true });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { transactionId } = req.params;
  
  const isVerified = await paymentService.verifyPayment(transactionId);
  
  if (!isVerified) {
    return next(new AppError('Payment not verified', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment verified successfully'
  });
});
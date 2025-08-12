// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.get('/verify/:transactionId', paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
// services/payment.service.js
const axios = require('axios');
const Booking = require('../models/Booking');
const AppError = require('../utils/appError');

/**
 * Initiate a Mobile Money payment via Fapshi
 * @param {string} bookingId - The booking ID reference
 * @param {string} momoNumber - Mobile money number (format: 2376XXXXXXX)
 * @param {number} amount - Amount in XAF
 * @returns {Promise<Object>} Payment response
 * @throws {AppError} If payment fails
 */
exports.initiateMomoPayment = async (bookingId, momoNumber, amount) => {
  try {
    // Validate environment variables
    if (!process.env.FAPSHI_API_USER_COLLECTION || !process.env.FAPSHI_API_KEY_COLLECTION) {
      throw new Error('Fapshi API credentials not configured');
    }

    // Log payment initiation
    console.log('Initiating MoMo payment:', {
      bookingId,
      momoNumber: momoNumber.replace(/(\d{3})\d+(\d{3})/, '$1****$2'), // Mask sensitive data
      amount,
      apiUser: process.env.FAPSHI_API_USER_COLLECTION ? 'configured' : 'missing',
      environment: process.env.NODE_ENV || 'development'
    });

    // Prepare payload
    const payload = {
      amount: Math.round(amount * 100), // Convert to cents
      phone: momoNumber,
      apiUser: process.env.FAPSHI_API_USER_COLLECTION,
      apiKey: process.env.FAPSHI_API_KEY_COLLECTION,
      reference: `booking_${bookingId}`,
      callbackUrl: `${process.env.APP_URL}/api/v1/payments/webhook`,
      metadata: {
        bookingId,
        service: 'bus-ticketing'
      }
    };

    // Initiate payment
    const response = await axios.post(
      `${process.env.FAPSHI_URL}/direct-pay`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 15000 // 15 seconds timeout
      }
    );

    // Validate response
    if (!response.data?.transactionId) {
      throw new Error('Invalid response from payment gateway');
    }

    // Update booking record
    await Booking.findByIdAndUpdate(
      bookingId,
      {
        'payment.transactionId': response.data.transactionId,
        'payment.status': 'initiated',
        'payment.initiatedAt': new Date()
      },
      { new: true }
    );

    return {
      success: true,
      transactionId: response.data.transactionId,
      paymentStatus: 'initiated',
      timestamp: new Date(),
      ...(response.data.paymentInstructions && { 
        instructions: response.data.paymentInstructions 
      })
    };

  } catch (error) {
    // Detailed error logging
    const errorDetails = {
      timestamp: new Date().toISOString(),
      operation: 'momo_payment_initiation',
      error: error.message,
      stack: error.stack,
      responseData: error.response?.data,
      requestConfig: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      },
      bookingId,
      amount
    };

    console.error('Payment Initiation Failed:', JSON.stringify(errorDetails, null, 2));

    // Update booking as failed
    await Booking.findByIdAndUpdate(
      bookingId,
      { 'payment.status': 'failed' },
      { new: true }
    );

    throw new AppError(
      error.response?.data?.message || 'Payment processing failed', 
      error.response?.status || 500
    );
  }
};

/**
 * Verify a payment transaction
 * @param {string} transactionId - Transaction ID from Fapshi
 * @returns {Promise<boolean>} True if payment is successful
 */
exports.verifyPayment = async (transactionId) => {
  try {
    const response = await axios.get(
      `${process.env.FAPSHI_URL}/transaction/${transactionId}`,
      {
        headers: {
          'api-user': process.env.FAPSHI_API_USER_COLLECTION,
          'api-key': process.env.FAPSHI_API_KEY_COLLECTION,
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      }
    );

    const isSuccessful = response.data.status === 'SUCCESSFUL';

    if (isSuccessful) {
      await Booking.findOneAndUpdate(
        { 'payment.transactionId': transactionId },
        { 
          'payment.status': 'completed',
          'payment.completedAt': new Date(),
          'status': 'confirmed' 
        }
      );
    }

    return isSuccessful;

  } catch (error) {
    console.error('Payment Verification Error:', {
      transactionId,
      error: error.message,
      response: error.response?.data
    });
    throw new AppError('Payment verification failed', 500);
  }
};

/**
 * Webhook handler for payment notifications
 * @param {Object} webhookData - Webhook payload
 */
exports.handlePaymentWebhook = async (webhookData) => {
  try {
    const { transactionId, status, amount } = webhookData;

    if (status === 'SUCCESSFUL') {
      await Booking.findOneAndUpdate(
        { 'payment.transactionId': transactionId },
        { 
          'payment.status': 'completed',
          'payment.amountReceived': amount / 100, // Convert back to XAF
          'payment.completedAt': new Date(),
          'status': 'confirmed'
        }
      );
      return { success: true };
    }

    return { success: false, reason: 'Unsuccessful payment status' };

  } catch (error) {
    console.error('Webhook Processing Error:', error);
    throw new AppError('Failed to process webhook', 500);
  }
};
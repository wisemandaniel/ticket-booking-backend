require('dotenv').config(); // This must be at the VERY TOP

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Rest of your app configuration
connectDB(); // Now this will have access to process.env

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const bookingRoutes = require('./routes/booking.routes');
const travelRoutes = require('./routes/travel.routes');
const agencyRoutes = require('./routes/agency.routes');

// Error handling middleware
app.use(require('./middlewares/error.middleware'));

app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/travels', travelRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/agencies', agencyRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Send JSON for API errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Fallback to HTML for non-API routes
  res.status(err.statusCode).render('error', {
    message: err.message
  });
});

app.use((err, req, res, next) => {
  // Handle duplicate key errors (E11000)
  if (err.code === 11000) {
    // Extract the duplicate key information
    const keyValue = err.keyValue;
    let message = 'Duplicate key error';
    
    // Handle seat booking conflicts specifically
    if (err.keyPattern && err.keyPattern['agency.busNumber'] && err.keyPattern['travelDate'] && err.keyPattern['seats.seatNumber']) {
      message = `Seat ${keyValue['seats.seatNumber']} is already booked on bus ${keyValue['agency.busNumber']} for ${new Date(keyValue.travelDate).toLocaleDateString()}`;
    }
    
    return res.status(400).json({
      status: 'fail',
      message
    });
  }

  // Handle other types of errors
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;  
// controllers/profile.controller.js
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('bookings');
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  // 1) Filter out unwanted fields
  const filteredBody = {
    fullName: req.body.fullName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address
  };

  // 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});
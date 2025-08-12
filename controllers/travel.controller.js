// controllers/travel.controller.js
const Travel = require('../models/Travel');
const catchAsync = require('../utils/catchAsync'); // Add this import
const AppError = require('../utils/appError');

exports.getAllTravels = catchAsync(async (req, res, next) => {
  const travels = await Travel.find()
    .populate('agency')
    .sort('departure.time');

  res.status(200).json({
    status: 'success',
    results: travels.length,
    data: { travels }
  });
});

exports.getTravel = catchAsync(async (req, res, next) => {
  const travel = await Travel.findById(req.params.id).populate('agency');
  
  if (!travel) {
    return next(new AppError('No travel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { travel }
  });
});
// controllers/agency.controller.js
const Agency = require('../models/Agency');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createAgency = catchAsync(async (req, res, next) => {
  const agency = await Agency.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: { agency }
  });
});

exports.getAllAgencies = catchAsync(async (req, res, next) => {
  const agencies = await Agency.find().sort('name');
  
  res.status(200).json({
    status: 'success',
    results: agencies.length,
    data: { agencies }
  });
});

exports.getAgency = catchAsync(async (req, res, next) => {
  const agency = await Agency.findById(req.params.id);
  
  if (!agency) {
    return next(new AppError('No agency found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { agency }
  });
});

exports.updateAgency = catchAsync(async (req, res, next) => {
  const agency = await Agency.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!agency) {
    return next(new AppError('No agency found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { agency }
  });
});

exports.deleteAgency = catchAsync(async (req, res, next) => {
  const agency = await Agency.findByIdAndDelete(req.params.id);
  
  if (!agency) {
    return next(new AppError('No agency found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
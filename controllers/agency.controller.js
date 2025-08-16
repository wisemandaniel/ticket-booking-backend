const Agency = require('../models/Agency');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// POST /agencies
exports.createAgency = catchAsync(async (req, res, next) => {
  const { name, destinations } = req.body;

  // 1. Basic validation
  if (!name) {
    return next(new AppError('Agency name is required', 400));
  }

  if (destinations && !Array.isArray(destinations)) {
    return next(new AppError('Destinations must be an array', 400));
  }

  // 2. Check for empty strings in destinations
  if (destinations) {
    const hasEmpty = destinations.some(dest => typeof dest !== 'string' || dest.trim() === '');
    if (hasEmpty) {
      return next(new AppError('Destination names cannot be empty', 400));
    }
  }

  try {
    const agency = await Agency.create({ name, destinations });
    res.status(201).json({
      status: 'success',
      data: { agency }
    });
  } catch (err) {
    // 3. Handle duplicate name error
    if (err.code === 11000 && err.keyPattern?.name) {
      return next(new AppError('An agency with this name already exists', 400));
    }
    // 4. Handle other unexpected errors
    return next(new AppError('Failed to create agency', 500));
  }
});

// GET /agencies
exports.getAllAgencies = catchAsync(async (req, res, next) => {
  try {
    const agencies = await Agency.find().sort('name');
    res.status(200).json({
      status: 'success',
      results: agencies.length,
      data: { agencies }
    });
  } catch (err) {
    return next(new AppError('Failed to retrieve agencies', 500));
  }
});

// GET /agencies/:id
exports.getAgency = catchAsync(async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id);
    if (!agency) {
      return next(new AppError('Agency not found', 404));
    }
    res.status(200).json({ status: 'success', data: { agency } });
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      return next(new AppError('Invalid agency ID', 400));
    }
    return next(new AppError('Failed to retrieve agency', 500));
  }
});

// PATCH /agencies/:id
exports.updateAgency = catchAsync(async (req, res, next) => {
  try {
    const agency = await Agency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!agency) {
      return next(new AppError('Agency not found', 404));
    }
    
    res.status(200).json({ status: 'success', data: { agency } });
  } catch (err) {
    // Handle duplicate name error on update
    if (err.code === 11000 && err.keyPattern?.name) {
      return next(new AppError('An agency with this name already exists', 400));
    }
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return next(new AppError(err.message, 400));
    }
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      return next(new AppError('Invalid agency ID', 400));
    }
    return next(new AppError('Failed to update agency', 500));
  }
});

// DELETE /agencies/:id
exports.deleteAgency = catchAsync(async (req, res, next) => {
  try {
    const agency = await Agency.findByIdAndDelete(req.params.id);
    if (!agency) {
      return next(new AppError('Agency not found', 404));
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      return next(new AppError('Invalid agency ID', 400));
    }
    return next(new AppError('Failed to delete agency', 500));
  }
});

// GET /api/v1/agencies/search?q=<destination>
exports.searchByDestination = catchAsync(async (req, res, next) => {
  // 1) Validate query parameter
  if (!req.query.q) {
    return next(new AppError('Please provide a search term (q parameter)', 400));
  }

  const searchTerm = req.query.q.trim();
  
  // 2) Case-insensitive search with regex
  const agencies = await Agency.find({
    destinations: { 
      $regex: searchTerm, 
      $options: 'i' // 'i' for case-insensitive
    }
  }).sort('name');

  // 3) Handle no results
  if (agencies.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'No agencies found for this destination',
      data: { agencies: [] }
    });
  }

  // 4) Return results
  res.status(200).json({
    status: 'success',
    results: agencies.length,
    data: { agencies }
  });
});
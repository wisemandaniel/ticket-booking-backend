// routes/travel.routes.js
const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travel.controller');

router.get('/', travelController.getAllTravels);

module.exports = router;
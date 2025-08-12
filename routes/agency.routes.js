// routes/agency.routes.js
const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agency.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const restrictTo = require('../middlewares/auth.middleware').restrictTo;

// // Protect all routes after this middleware
router.use(authMiddleware.protect);
// router.use(restrictTo('admin')); // Only admins can manage agencies

router.post('/', agencyController.createAgency);
router.get('/', agencyController.getAllAgencies);
router.get('/:id', agencyController.getAgency);
router.patch('/:id', agencyController.updateAgency);
router.delete('/:id', agencyController.deleteAgency);

module.exports = router;
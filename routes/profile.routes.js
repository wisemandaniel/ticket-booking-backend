// routes/profile.routes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.protect);

router.get('/me', profileController.getProfile);
router.patch('/update', profileController.updateProfile);

module.exports = router;
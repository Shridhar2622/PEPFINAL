const express = require('express');
const reasonController = require('../../controllers/reasonController');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/', reasonController.getAllReasons);

// Admin only routes
router.post('/', restrictTo('ADMIN'), reasonController.createReason);

module.exports = router;

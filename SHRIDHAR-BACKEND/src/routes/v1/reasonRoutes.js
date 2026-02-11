const express = require('express');
const reasonController = require('../../controllers/reasonController');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/', reasonController.getAllReasons);

// Admin only routes
router.post('/', restrictTo('ADMIN'), reasonController.createReason);
router.delete('/:id', restrictTo('ADMIN'), reasonController.deleteReason);

module.exports = router;

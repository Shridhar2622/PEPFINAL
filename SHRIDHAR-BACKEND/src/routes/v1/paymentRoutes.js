const express = require('express');
const paymentController = require('../../controllers/paymentController');
const { protect } = require('../../middlewares/auth');

const router = express.Router();

router.use(protect); // All payment routes need login

router.post('/process', paymentController.processPayment);

module.exports = router;

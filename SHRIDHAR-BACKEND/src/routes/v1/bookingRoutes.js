const express = require('express');
const bookingController = require('../../controllers/bookingController');
const { protect, restrictTo } = require('../../middlewares/auth');
const validate = require('../../utils/validate');
const { createBooking, updateBookingStatus, getBooking } = require('../../validations/booking.validation');
const reviewRouter = require('./reviewRoutes');

const upload = require('../../middlewares/upload');

const router = express.Router();

// Mount review router
router.use('/:bookingId/reviews', reviewRouter);

// All routes require authentication
router.use(protect);

// Stats route (MUST be before /:bookingId)
router.get('/stats', restrictTo('TECHNICIAN'), bookingController.getTechnicianStats);

router
    .route('/')
    .post(upload.single('referenceImage'), validate(createBooking), bookingController.createBooking)
    .get(bookingController.getAllBookings);

router
    .route('/:bookingId')
    .get(validate(getBooking), bookingController.getBooking);

router
    .route('/:bookingId/status')
    .patch(upload.array('partImages', 5), validate(updateBookingStatus), bookingController.updateBookingStatus);

module.exports = router;

const paymentService = require('../services/paymentService');
const AppError = require('../utils/AppError');

exports.processPayment = async (req, res, next) => {
    try {
        const { bookingId, paymentMethod } = req.body;

        if (!bookingId) {
            return next(new AppError('Booking ID is required', 400));
        }

        const result = await paymentService.processPayment({
            bookingId,
            user: req.user,
            paymentMethod
        });

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

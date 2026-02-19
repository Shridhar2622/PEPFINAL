const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const notificationService = require('./notificationService');
const crypto = require('crypto');

class PaymentService {
    constructor() {
        this.isEnabled = process.env.ENABLE_PAYMENTS === 'true';
    }

    /**
     * Process a payment for a booking
     * @param {Object} params
     * @param {string} params.bookingId
     * @param {Object} params.user - The user object
     * @param {string} [params.paymentMethod='SIMULATED']
     */
    async processPayment({ bookingId, user, paymentMethod = 'SIMULATED' }) {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new AppError('Booking not found', 404);
        }

        if (booking.paymentStatus === 'PAID') {
            throw new AppError('Booking is already paid', 400);
        }

        // 1. Create Pending Transaction
        const transaction = await Transaction.create({
            user: user._id,
            technician: booking.technician,
            booking: booking._id,
            amount: booking.price,
            paymentMethod: this.isEnabled ? paymentMethod : 'SIMULATED',
            status: 'PENDING',
            transactionId: `TXN_${crypto.randomBytes(8).toString('hex').toUpperCase()}`
        });

        // 2. Process (Simulated or Real)
        if (!this.isEnabled) {
            // SIMULATION MODE: Auto-Success
            transaction.status = 'SUCCESS';
            transaction.gatewayResponse = { message: 'Simulated Payment Successful' };
            await transaction.save();

            // Update Booking
            booking.paymentStatus = 'PAID'; // We need to add this field to Booking model if not exists
            await booking.save({ validateBeforeSave: false }); // Avoid strict validation issues for now

            // Send Notifications
            await notificationService.send({
                recipient: booking.technician,
                type: 'PAYMENT_RECEIVED',
                title: 'Payment Received',
                message: `You received a payment of ₹${transaction.amount} for your service.`,
                data: { bookingId: booking._id, transactionId: transaction.transactionId }
            });

            await notificationService.send({
                recipient: booking.customer || user._id,
                type: 'PAYMENT_SUCCESS',
                title: 'Payment Successful',
                message: `Your payment of ₹${transaction.amount} was successful.`,
                data: { bookingId: booking._id, transactionId: transaction.transactionId }
            });

            return {
                success: true,
                message: 'Payment simulated successfully',
                transaction
            };
        } else {

            // For now, fail if enabled but no gateway
            transaction.status = 'FAILED';
            await transaction.save();
            throw new AppError('Real payments are not yet configured.', 501);
        }
    }
}

module.exports = new PaymentService();

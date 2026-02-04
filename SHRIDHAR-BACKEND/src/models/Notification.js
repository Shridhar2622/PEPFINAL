const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Notification must have a recipient']
    },
    type: {
        type: String,
        required: [true, 'Notification must have a type']
        // e.g., 'BOOKING_REQUEST', 'JOB_COMPLETED', 'PAYMENT_RECEIVED'
    },
    title: {
        type: String,
        required: [true, 'Notification must have a title'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Notification must have a message']
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        // Stores flexible payload like { bookingId: '...', serviceId: '...' }
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '30d' } // TTL Index: Auto-delete documents after 30 days
    }
}, {
    timestamps: true
});

// notificationSchema.index({ recipient: 1, isRead: 1 });
// notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

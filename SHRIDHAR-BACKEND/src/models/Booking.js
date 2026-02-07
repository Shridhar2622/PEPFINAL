const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a customer']
    },
    technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // required: [true, 'Booking must belong to a technician'] // Decoupled: Assigned later
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Booking must be for a category']
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Booking must be for a service']
    },
    status: {
        type: String,
        enum: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'],
        default: 'PENDING'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'REFUNDED'],
        default: 'PENDING'
    },
    scheduledAt: {
        type: Date,
        required: [true, 'Booking must have a valid date']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price']
    },
    notes: {
        type: String,
        trim: true
    },
    // Location & ETA Feature - Standardized location fields
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number], // [longitude, latitude]
        address: String
    },
    pickupLocation: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: [Number],
        address: String
    },
    dropLocation: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: [Number],
        address: String
    },
    distance: Number, // in kilometers
    estimatedDuration: Number, // in minutes
    // --- Completion Fields (from PHP logic) ---
    finalAmount: {
        type: Number
    },
    extraReason: {
        type: String,
        trim: true
    },
    technicianNote: {
        type: String,
        trim: true
    },
    partImages: [{
        type: String
    }],
    securityPin: {
        type: String
        // required: [true, 'Happy Pin is required for completion verification'] // Generated on assignment
    },
    referenceImage: {
        type: String
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bookingSchema.virtual('review', {
    ref: 'Review',
    foreignField: 'booking',
    localField: '_id',
    justOne: true
});

// bookingSchema.index({ customer: 1, status: 1 });
// bookingSchema.index({ technician: 1, status: 1 });
// bookingSchema.index({ scheduledAt: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

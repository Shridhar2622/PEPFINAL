const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // required: [true, 'Service must belong to a technician'] // Made optional for Admin-managed global services
    },
    title: {
        type: String,
        required: [true, 'A service must have a title'],
        trim: true,
        maxlength: [100, 'Service title must have less than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'A service must have a description']
    },
    price: {
        type: Number,
        required: [true, 'A service must have a price'],
        min: [0, 'Price must be positive']
    },
    category: {
        type: String,
        required: [true, 'A service must have a category'],
        index: true
    },
    headerImage: {
        type: String,
        default: 'default-service.jpg'
    },
    originalPrice: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0,
        set: v => Math.round(v * 10) / 10
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// serviceSchema.index({ technician: 1, isActive: 1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

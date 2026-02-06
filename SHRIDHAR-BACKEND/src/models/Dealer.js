const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Dealer name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Dealer = mongoose.model('Dealer', dealerSchema);

module.exports = Dealer;

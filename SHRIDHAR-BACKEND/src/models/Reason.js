const mongoose = require('mongoose');

const reasonSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: [true, 'Reason description is required'],
        trim: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['REGULAR', 'TRANSPORT'],
        default: 'REGULAR'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Reason = mongoose.model('Reason', reasonSchema);

module.exports = Reason;

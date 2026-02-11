const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Log must belong to an admin']
    },
    action: {
        type: String,
        required: [true, 'Log must have an action type'],
        enum: [
            'USER_DISABLE', 'USER_ENABLE',
            'TECHNICIAN_APPROVE', 'TECHNICIAN_REJECT', 'TECHNICIAN_DISABLE',
            'SERVICE_TOGGLE',
            'BOOKING_CANCEL',
            'SYSTEM_UPDATE'
        ]
    },
    targetType: {
        type: String,
        required: [true, 'Log must have a target entity type'],
        enum: ['User', 'TechnicianProfile', 'Service', 'Booking', 'System']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Log must target a specific entity ID']
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

activityLogSchema.index({ admin: 1 });
activityLogSchema.index({ targetId: 1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;

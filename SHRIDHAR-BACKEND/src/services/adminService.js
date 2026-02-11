const ActivityLog = require('../models/ActivityLog');

class AdminService {
    /**
     * Create an activity log entry
     * @param {Object} params
     * @param {string} params.adminId
     * @param {string} params.action - Enum value
     * @param {string} params.targetType - Enum value
     * @param {string} params.targetId
     * @param {Object} [params.details]
     * @param {string} [params.ipAddress]
     * @param {string} [params.userAgent]
     */
    async logAction({ adminId, action, targetType, targetId, details = {}, ipAddress, userAgent }) {
        try {
            await ActivityLog.create({
                admin: adminId,
                action,
                targetType,
                targetId,
                details,
                ipAddress,
                userAgent
            });
        } catch (error) {
            console.error('FAILED TO LOG ADMIN ACTION:', error);
            // Don't crash the request if logging fails, but alert system admins in a real app
        }
    }
}

module.exports = new AdminService();

const Notification = require('../models/Notification');
const socketService = require('../utils/socket'); // Import Socket Service

class NotificationService {
    /**
     * Send a notification to a specific user
     * @param {Object} payload - Notification data
     * @param {string} payload.recipient - User ID of recipient
     * @param {string} payload.type - Type of notification (e.g. BOOKING_REQUEST)
     * @param {string} payload.title - Notification title
     * @param {string} payload.message - Notification message
     * @param {Object} [payload.data] - Optional metadata
     */
    async send({ recipient, type, title, message, data = {} }) {
        try {
            // 1. Persist to Database (CRITICAL: Always store first)
            const notification = await Notification.create({
                recipient,
                type,
                title,
                message,
                data
            });

            // 2. Real-time Delivery (Socket.IO)
            socketService.emitToUser(recipient, 'notification', notification);

            // 3. Push Notification / Email - Placeholder
            // TODO: Call email service if needed

            // 3. Push Notification / Email - Placeholder
            // TODO: Call email service if needed

            return notification;
        } catch (error) {
            console.error('Notification Service Error:', error);
            // We don't want to crash the main flow if notification fails, 
            // but we should log it.
            // In a robust system, we might use a queue here.
        }
    }

    /**
     * Get unread notifications for a user
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    async getUnread(userId) {
        return await Notification.find({ recipient: userId, isRead: false })
            .sort('-createdAt')
            .limit(20);
    }

    /**
     * Mark notification as read
     * @param {string} notificationId 
     * @param {string} userId - For security check
     */
    async markAsRead(notificationId, userId) {
        return await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );
    }

    /**
     * Mark all notifications as read for a user
     * @param {string} userId 
     */
    async markAllAsRead(userId) {
        return await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
    }
}

module.exports = new NotificationService();

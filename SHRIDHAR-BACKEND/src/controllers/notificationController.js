const notificationService = require('../services/notificationService');
const AppError = require('../utils/AppError');

exports.getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getUnread(req.user.id);
        res.status(200).json({
            status: 'success',
            results: notifications.length,
            data: { notifications }
        });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user.id);
        if (!notification) {
            return next(new AppError('Notification not found or not yours', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { notification }
        });
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};

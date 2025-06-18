const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Routes for notifications
router.get('/', authMiddleware, notificationController.getUserNotifications);
router.post('/', authMiddleware, notificationController.createNotification); // Should be internal access only
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);
router.put('/mark-all-read', authMiddleware, notificationController.markAllAsRead);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

// Routes for preferences
router.get('/preferences', authMiddleware, notificationController.getNotificationPreferences);
router.put('/preferences', authMiddleware, notificationController.updateNotificationPreferences);

module.exports = router; 
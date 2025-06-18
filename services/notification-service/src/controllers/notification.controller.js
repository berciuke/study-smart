const Notification = require('../models/notification.model');
const NotificationPreferences = require('../models/preferences.model');

exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy pobieraniu powiadomień', error });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const { userId, type, title, message, data, link } = req.body;
        const newNotification = new Notification({ userId, type, title, message, data, link });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(400).json({ message: 'Błąd przy tworzeniu powiadomienia', error });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy pobieraniu liczby nieprzeczytanych powiadomień', error });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'Wszystkie powiadomienia zostały oznaczone jako przeczytane' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy oznaczaniu powiadomień jako przeczytane', error });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Nie znaleziono powiadomienia' });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy oznaczaniu powiadomienia jako przeczytane', error });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!notification) {
            return res.status(404).json({ message: 'Nie znaleziono powiadomienia' });
        }
        res.status(200).json({ message: 'Powiadomienie usunięte' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy usuwaniu powiadomienia', error });
    }
};

exports.getNotificationPreferences = async (req, res) => {
    try {
        let preferences = await NotificationPreferences.findOne({ userId: req.user.id });
        if (!preferences) {
            preferences = new NotificationPreferences({ userId: req.user.id });
            await preferences.save();
        }
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera przy pobieraniu preferencji', error });
    }
};

exports.updateNotificationPreferences = async (req, res) => {
    try {
        const preferences = await NotificationPreferences.findOneAndUpdate(
            { userId: req.user.id },
            { preferences: req.body.preferences },
            { new: true, upsert: true }
        );
        res.json(preferences);
    } catch (error) {
        res.status(400).json({ message: 'Błąd przy aktualizacji preferencji', error });
    }
}; 
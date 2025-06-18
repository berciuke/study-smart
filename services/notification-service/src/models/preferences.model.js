const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  preferences: {
    courseEnrollment: { type: Boolean, default: true },
    quizCompleted: { type: Boolean, default: true },
    courseUpdated: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true },
  },
}, {
  timestamps: { createdAt: false, updatedAt: true },
  versionKey: false,
});

const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);

module.exports = NotificationPreferences; 
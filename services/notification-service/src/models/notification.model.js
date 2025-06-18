const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['course_enrollment', 'quiz_completed', 'course_updated', 'system'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  link: {
    type: String,
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
  versionKey: false,
});

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 * 24 * 30 }); // Default 30 days TTL

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 
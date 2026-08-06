const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:  {
    type: String,
    required: true,
    enum: [
      'USER_REGISTERED', 'USER_LOGGED_IN', 'USER_UPDATED',
      'BOOK_ADDED', 'BOOK_UPDATED', 'BOOK_DELETED',
      'RESERVATION_CREATED', 'RESERVATION_APPROVED', 'RESERVATION_ISSUED',
      'RESERVATION_RETURNED', 'RESERVATION_CANCELLED', 'BOOK_RENEWED',
      'FINE_PAID', 'PROFILE_UPDATED', 'CATEGORY_ADDED',
    ],
  },
  details: { type: String, trim: true },  // human-readable description
  meta:    { type: mongoose.Schema.Types.Mixed }, // extra structured data
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

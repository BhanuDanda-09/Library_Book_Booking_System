const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },

  status: {
    type:    String,
    enum:    ['pending', 'approved', 'issued', 'returned', 'cancelled', 'overdue'],
    default: 'pending',
  },

  // ── Dates ─────────────────────────────────────────────────────────────────
  reservationDate: { type: Date, default: Date.now },
  issueDate:       { type: Date },
  dueDate:         { type: Date },
  returnDate:      { type: Date },

  // ── Renewal ───────────────────────────────────────────────────────────────
  renewalCount: { type: Number, default: 0, max: 2 }, // max 2 renewals
  renewedAt:    { type: Date },

  // ── Fine ──────────────────────────────────────────────────────────────────
  fine: {
    amount: { type: Number, default: 0 },
    paid:   { type: Boolean, default: false },
  },

  // ── Metadata ──────────────────────────────────────────────────────────────
  notes:      { type: String, trim: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

// Performance indexes
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ book: 1, status: 1 });
reservationSchema.index({ status: 1, dueDate: 1 });
reservationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reservation', reservationSchema);
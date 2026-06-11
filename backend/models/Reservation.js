const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'issued', 'returned', 'cancelled', 'overdue'],
    default: 'pending',
  },
  reservationDate: { type: Date, default: Date.now },
  issueDate:       { type: Date },
  dueDate:         { type: Date },
  returnDate:      { type: Date },
  fine: {
    amount: { type: Number, default: 0 },
    paid:   { type: Boolean, default: false },
  },
  notes:      { type: String, trim: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
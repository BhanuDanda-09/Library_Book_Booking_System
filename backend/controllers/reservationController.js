const Reservation = require('../models/Reservation');
const Book        = require('../models/Book');
const User        = require('../models/User');

// POST /api/reservations
exports.createReservation = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book || !book.isActive)
      return res.status(404).json({ success: false, message: 'Book not found.' });
    if (book.availableCopies < 1)
      return res.status(400).json({ success: false, message: 'No copies available.' });

    const reservation = await Reservation.create({ user: req.user._id, book: bookId });
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({ success: true, message: 'Reservation created!', reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reservations/my
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('book').sort('-createdAt');
    res.json({ success: true, reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reservations  (librarian)
exports.getAllReservations = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const reservations = await Reservation.find(query)
      .populate('user', 'name email')
      .populate('book', 'title author')
      .sort('-createdAt');
    res.json({ success: true, reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/reservations/:id/status  (librarian)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id).populate('book user');
    if (!reservation)
      return res.status(404).json({ success: false, message: 'Reservation not found.' });

    const update = { status, approvedBy: req.user._id };

    if (status === 'issued') {
      update.issueDate = new Date();
      update.dueDate   = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
    }
    if (status === 'returned') {
      update.returnDate = new Date();
      await Book.findByIdAndUpdate(reservation.book._id, { $inc: { availableCopies: 1 } });
      if (reservation.dueDate && new Date() > reservation.dueDate) {
        const days = Math.ceil((new Date() - reservation.dueDate) / 86400000);
        update['fine.amount'] = days * 5;
      }
    }
    if (status === 'cancelled') {
      await Book.findByIdAndUpdate(reservation.book._id, { $inc: { availableCopies: 1 } });
    }

    const updated = await Reservation.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, message: `Status updated to ${status}`, reservation: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
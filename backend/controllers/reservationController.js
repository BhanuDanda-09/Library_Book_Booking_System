const Reservation  = require('../models/Reservation');
const Book         = require('../models/Book');
const Notification = require('../models/Notification');
const ActivityLog  = require('../models/ActivityLog');

const FINE_PER_DAY = 5; // ₹5 per day overdue
const LOAN_DAYS    = 14;

// ── POST /api/reservations ─────────────────────────────────────────────────────
exports.createReservation = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }
    if (book.availableCopies < 1) {
      return res.status(400).json({ success: false, message: 'No copies available.' });
    }

    // Prevent duplicate active reservation
    const existing = await Reservation.findOne({
      user:   req.user._id,
      book:   bookId,
      status: { $in: ['pending', 'approved', 'issued'] },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active reservation for this book.' });
    }

    const reservation = await Reservation.create({ user: req.user._id, book: bookId });
    book.availableCopies -= 1;
    book.reservedCopies  = (book.reservedCopies || 0) + 1;
    await book.save();

    await ActivityLog.create({
      user:    req.user._id,
      action:  'RESERVATION_CREATED',
      details: `${req.user.name} reserved "${book.title}"`,
      meta:    { bookId, reservationId: reservation._id },
    });

    res.status(201).json({ success: true, message: 'Reservation created!', reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reservations/my ───────────────────────────────────────────────────
exports.getMyReservations = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status && status !== 'All') query.status = status.toLowerCase();

    const reservations = await Reservation.find(query)
      .populate('book')
      .sort('-createdAt');

    res.json({ success: true, reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reservations  (librarian/admin) ───────────────────────────────────
exports.getAllReservations = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status.toLowerCase();

    const skip  = (page - 1) * limit;
    const total = await Reservation.countDocuments(query);

    let reservations = await Reservation.find(query)
      .populate('user', 'name email studentId department profilePicture')
      .populate('book', 'title author isbn coverImage category')
      .sort('-createdAt')
      .skip(skip)
      .limit(+limit);

    // Client-side search filter for user/book name (quick implementation)
    if (search) {
      const s = search.toLowerCase();
      reservations = reservations.filter(r =>
        r.user?.name?.toLowerCase().includes(s) ||
        r.book?.title?.toLowerCase().includes(s) ||
        r.book?.isbn?.toLowerCase().includes(s)
      );
    }

    res.json({ success: true, total, reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/reservations/:id/status  (librarian/admin) ───────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const reservation = await Reservation.findById(req.params.id).populate('book user');
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const update = { status, approvedBy: req.user._id };
    if (notes) update.notes = notes;

    // Status-specific logic
    if (status === 'issued') {
      update.issueDate = new Date();
      update.dueDate   = new Date(Date.now() + LOAN_DAYS * 24 * 60 * 60 * 1000);
      // Increment book borrowCount
      await Book.findByIdAndUpdate(reservation.book._id, {
        $inc: { borrowCount: 1, issuedCopies: 1, reservedCopies: -1 },
      });
      // Notify user
      await Notification.create({
        user:    reservation.user._id,
        title:   'Book Issued ✅',
        message: `"${reservation.book.title}" has been issued. Due date: ${new Date(update.dueDate).toLocaleDateString()}`,
        type:    'success',
      });
    }

    if (status === 'returned') {
      update.returnDate = new Date();
      await Book.findByIdAndUpdate(reservation.book._id, {
        $inc: { availableCopies: 1, issuedCopies: -1 },
      });
      // Fine calculation
      if (reservation.dueDate && new Date() > reservation.dueDate) {
        const days = Math.ceil((new Date() - reservation.dueDate) / 86400000);
        update['fine.amount'] = days * FINE_PER_DAY;
        await Notification.create({
          user:    reservation.user._id,
          title:   'Fine Applied ⚠️',
          message: `A fine of ₹${update['fine.amount']} has been applied for ${days} overdue days on "${reservation.book.title}".`,
          type:    'warning',
        });
      }
    }

    if (status === 'approved') {
      await Notification.create({
        user:    reservation.user._id,
        title:   'Reservation Approved 📚',
        message: `Your reservation for "${reservation.book.title}" has been approved. Please collect it from the library.`,
        type:    'info',
      });
    }

    if (status === 'cancelled') {
      // Return copy to available stock
      const prevStatus = reservation.status;
      if (prevStatus === 'pending' || prevStatus === 'approved') {
        await Book.findByIdAndUpdate(reservation.book._id, {
          $inc: { availableCopies: 1, reservedCopies: -1 },
        });
      }
    }

    const updated = await Reservation.findByIdAndUpdate(req.params.id, update, { new: true });

    await ActivityLog.create({
      user:    req.user._id,
      action:  `RESERVATION_${status.toUpperCase()}`,
      details: `"${reservation.book.title}" status changed to ${status} for ${reservation.user.name}`,
      meta:    { reservationId: reservation._id },
    });

    res.json({ success: true, message: `Status updated to ${status}`, reservation: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/reservations/:id/renew  (student) ────────────────────────────────
exports.renewBook = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('book');
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (reservation.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Only issued books can be renewed.' });
    }
    if (reservation.renewalCount >= 2) {
      return res.status(400).json({ success: false, message: 'Maximum renewals (2) reached.' });
    }

    const newDueDate = new Date((reservation.dueDate || Date.now()) + LOAN_DAYS * 24 * 60 * 60 * 1000);

    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        dueDate:      newDueDate,
        renewedAt:    new Date(),
        $inc: { renewalCount: 1 },
      },
      { new: true }
    );

    await ActivityLog.create({
      user:    req.user._id,
      action:  'BOOK_RENEWED',
      details: `"${reservation.book.title}" renewed. New due date: ${newDueDate.toLocaleDateString()}`,
    });

    res.json({ success: true, message: `Book renewed! New due date: ${newDueDate.toLocaleDateString()}`, reservation: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/reservations/:id  (student self-cancel pending) ────────────────
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('book');
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (!['pending', 'approved'].includes(reservation.status)) {
      return res.status(400).json({ success: false, message: 'Only pending or approved reservations can be cancelled.' });
    }

    await Book.findByIdAndUpdate(reservation.book._id, {
      $inc: { availableCopies: 1, reservedCopies: -1 },
    });

    reservation.status = 'cancelled';
    await reservation.save();

    await ActivityLog.create({
      user:    req.user._id,
      action:  'RESERVATION_CANCELLED',
      details: `${req.user.name} cancelled reservation for "${reservation.book.title}"`,
    });

    res.json({ success: true, message: 'Reservation cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reservations/stats  (librarian/admin) ────────────────────────────
exports.getReservationStats = async (req, res) => {
  try {
    const stats = await Reservation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const result = {};
    stats.forEach(s => { result[s._id] = s.count; });
    res.json({ success: true, stats: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
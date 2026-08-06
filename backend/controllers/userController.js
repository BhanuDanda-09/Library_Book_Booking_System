const User        = require('../models/User');
const Reservation = require('../models/Reservation');
const Book        = require('../models/Book');

// ── GET /api/users  (admin/librarian) ─────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role && role !== 'All') query.role = role;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip(skip).limit(+limit);

    res.json({ success: true, total, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────────────────────
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('wishlist', 'title author coverImage');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/users/:id  (admin) ───────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, studentId, department, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, studentId, department, isActive },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User updated!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/users/:id  (admin) ────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/users/:id/history ────────────────────────────────────────────────
exports.getUserBorrowHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip  = (page - 1) * limit;
    const total = await Reservation.countDocuments({ user: req.params.id });
    const reservations = await Reservation.find({ user: req.params.id })
      .populate('book', 'title author isbn coverImage')
      .sort('-createdAt')
      .skip(skip)
      .limit(+limit);
    res.json({ success: true, total, reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/users/wishlist/:bookId ──────────────────────────────────────────
exports.toggleWishlist = async (req, res) => {
  try {
    const user   = await User.findById(req.user._id);
    const bookId = req.params.bookId;

    const idx = user.wishlist.findIndex(id => id.toString() === bookId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.unshift(bookId);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist, inWishlist: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/users/wishlist ───────────────────────────────────────────────────
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'title author coverImage category availableCopies isbn');
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/users/recently-viewed/:bookId ───────────────────────────────────
exports.addRecentlyViewed = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const user   = await User.findById(req.user._id);

    user.recentlyViewed = user.recentlyViewed.filter(id => id.toString() !== bookId);
    user.recentlyViewed.unshift(bookId);
    user.recentlyViewed = user.recentlyViewed.slice(0, 10);

    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/users/my-stats ───────────────────────────────────────────────────
exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, active, returned, overdue, fineAgg] = await Promise.all([
      Reservation.countDocuments({ user: userId }),
      Reservation.countDocuments({ user: userId, status: { $in: ['pending', 'approved', 'issued'] } }),
      Reservation.countDocuments({ user: userId, status: 'returned' }),
      Reservation.countDocuments({ user: userId, status: 'overdue' }),
      Reservation.aggregate([
        { $match: { user: userId, 'fine.amount': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$fine.amount' } } },
      ]),
    ]);
    res.json({
      success: true,
      stats: { total, active, returned, overdue, totalFine: fineAgg[0]?.total || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

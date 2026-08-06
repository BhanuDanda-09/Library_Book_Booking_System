const Book        = require('../models/Book');
const User        = require('../models/User');
const Reservation = require('../models/Reservation');
const Category    = require('../models/Category');
const ActivityLog = require('../models/ActivityLog');

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalBooks,
      totalUsers,
      totalCategories,
      availableBooks,
      issuedCount,
      returnedCount,
      pendingCount,
      overdueCount,
      activeUsers,
      totalFineAgg,
    ] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student' }),
      Category.countDocuments({ isActive: true }),
      Book.aggregate([{ $group: { _id: null, total: { $sum: '$availableCopies' } } }]),
      Reservation.countDocuments({ status: 'issued' }),
      Reservation.countDocuments({ status: 'returned' }),
      Reservation.countDocuments({ status: 'pending' }),
      Reservation.countDocuments({ status: 'issued', dueDate: { $lt: now } }),
      Reservation.distinct('user', { status: { $in: ['pending', 'approved', 'issued'] } }),
      Reservation.aggregate([
        { $match: { 'fine.amount': { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$fine.amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalBooks,
        totalUsers,
        totalCategories,
        availableCopies:  availableBooks[0]?.total || 0,
        issuedCount,
        returnedCount,
        pendingCount,
        overdueCount,
        activeUsers:      activeUsers.length,
        totalFinesCollected: totalFineAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/activity
exports.getRecentActivity = async (req, res) => {
  try {
    const activities = await ActivityLog.find({})
      .populate('user', 'name email profilePicture role')
      .sort('-createdAt')
      .limit(20);
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/charts
exports.getChartData = async (req, res) => {
  try {
    const now         = new Date();
    const twelveMonths = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Monthly issued and returned (last 12 months)
    const [monthlyIssued, monthlyReturned] = await Promise.all([
      Reservation.aggregate([
        { $match: { status: { $in: ['issued', 'returned', 'overdue'] }, issueDate: { $gte: twelveMonths } } },
        { $group: { _id: { year: { $year: '$issueDate' }, month: { $month: '$issueDate' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Reservation.aggregate([
        { $match: { status: 'returned', returnDate: { $gte: twelveMonths } } },
        { $group: { _id: { year: { $year: '$returnDate' }, month: { $month: '$returnDate' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Category distribution
    const categoryDist = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Popular books (top 10 most borrowed)
    const popularBooks = await Book.find({ isActive: true, borrowCount: { $gt: 0 } })
      .sort('-borrowCount')
      .limit(10)
      .select('title author borrowCount coverImage');

    // Monthly user registrations (last 12 months)
    const monthlyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonths } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      charts: {
        monthlyIssued,
        monthlyReturned,
        categoryDistribution: categoryDist,
        popularBooks,
        monthlyUsers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

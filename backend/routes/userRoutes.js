const express = require('express');
const router  = express.Router();
const {
  getAllUsers, getUser, updateUser, deleteUser,
  getUserBorrowHistory, toggleWishlist, getWishlist,
  addRecentlyViewed, getMyStats,
} = require('../controllers/userController');
const { protect }  = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

// ── Current User ──────────────────────────────────────────────────────────────
router.get('/wishlist',                protect, getWishlist);
router.post('/wishlist/:bookId',       protect, toggleWishlist);
router.post('/recently-viewed/:bookId', protect, addRecentlyViewed);
router.get('/my-stats',                protect, getMyStats);

// ── Admin / Librarian ─────────────────────────────────────────────────────────
router.get('/',      protect, roleAuth('librarian', 'admin'), getAllUsers);
router.get('/:id',   protect, roleAuth('librarian', 'admin'), getUser);
router.put('/:id',   protect, roleAuth('admin'),              updateUser);
router.delete('/:id', protect, roleAuth('admin'),             deleteUser);
router.get('/:id/history', protect, roleAuth('librarian', 'admin'), getUserBorrowHistory);

module.exports = router;

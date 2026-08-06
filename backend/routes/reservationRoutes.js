const express = require('express');
const router  = express.Router();
const {
  createReservation, getMyReservations, getAllReservations,
  updateStatus, renewBook, cancelReservation, getReservationStats,
} = require('../controllers/reservationController');
const { protect }  = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

// ── Student Routes ────────────────────────────────────────────────────────────
router.post('/',         protect, roleAuth('student'), createReservation);
router.get('/my',        protect, getMyReservations);
router.put('/:id/renew', protect, roleAuth('student'), renewBook);
router.delete('/:id',    protect, roleAuth('student'), cancelReservation);

// ── Librarian / Admin Routes ───────────────────────────────────────────────────
router.get('/stats', protect, roleAuth('librarian', 'admin'), getReservationStats);
router.get('/',      protect, roleAuth('librarian', 'admin'), getAllReservations);
router.put('/:id/status', protect, roleAuth('librarian', 'admin'), updateStatus);

module.exports = router;
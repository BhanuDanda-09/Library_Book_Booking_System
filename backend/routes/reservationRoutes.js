const express = require('express');
const router  = express.Router();
const { createReservation, getMyReservations,
        getAllReservations, updateStatus } = require('../controllers/reservationController');
const { protect }  = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

router.post('/',          protect, roleAuth('student'),   createReservation);
router.get('/my',         protect, getMyReservations);
router.get('/',           protect, roleAuth('librarian'), getAllReservations);
router.put('/:id/status', protect, roleAuth('librarian'), updateStatus);

module.exports = router;
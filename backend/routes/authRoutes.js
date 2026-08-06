const express = require('express');
const router  = express.Router();

const {
  register, login, getMe, updateProfile, uploadProfilePicture,
  changePassword, forgotPassword, resetPassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// Try to load Cloudinary uploader, fall back gracefully if not configured
let upload;
try {
  const { uploadProfilePic } = require('../utils/cloudinary');
  upload = uploadProfilePic;
} catch {
  const multer = require('multer');
  upload = multer({ dest: 'uploads/' });
}

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register',        register);
router.post('/login',           login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// ── Protected ─────────────────────────────────────────────────────────────────
router.get('/me',               protect, getMe);
router.put('/update-profile',   protect, updateProfile);
router.put('/change-password',  protect, changePassword);
router.post('/upload-picture',  protect, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
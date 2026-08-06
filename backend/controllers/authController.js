const crypto      = require('crypto');
const jwt         = require('jsonwebtoken');
const User        = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// ── Helper ─────────────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (user) => ({
  _id:            user._id,
  name:           user.name,
  email:          user.email,
  role:           user.role,
  phone:          user.phone,
  studentId:      user.studentId,
  department:     user.department,
  profilePicture: user.profilePicture,
  isActive:       user.isActive,
  createdAt:      user.createdAt,
});

// ── POST /api/auth/register ────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, studentId, department } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role, phone, studentId, department });

    await ActivityLog.create({
      user:    user._id,
      action:  'USER_REGISTERED',
      details: `${user.name} registered as ${user.role}`,
    });

    res.status(201).json({ success: true, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact the library.' });
    }

    const token = generateToken(user._id);

    await ActivityLog.create({
      user:    user._id,
      action:  'USER_LOGGED_IN',
      details: `${user.name} logged in`,
    });

    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/auth/update-profile ───────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, studentId, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, studentId, department },
      { new: true, runValidators: true }
    );
    await ActivityLog.create({
      user:    user._id,
      action:  'PROFILE_UPDATED',
      details: `${user.name} updated their profile`,
    });
    res.json({ success: true, message: 'Profile updated!', user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/upload-picture ──────────────────────────────────────────────
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const imageUrl = req.file.path; // Cloudinary URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: imageUrl },
      { new: true }
    );
    res.json({ success: true, message: 'Profile picture updated!', user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/auth/change-password ──────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if user not found (security: don't reveal user existence)
      return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    // In production, send via nodemailer. For now, return token in dev mode.
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    if (process.env.NODE_ENV === 'development') {
      return res.json({ success: true, message: 'Reset link generated (dev mode).', resetUrl });
    }

    // TODO: Send email via nodemailer here
    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/auth/reset-password/:token ────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired.' });
    }

    user.password             = req.body.password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, message: 'Password reset successful!', token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
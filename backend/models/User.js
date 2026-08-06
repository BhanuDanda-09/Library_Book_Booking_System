const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const userSchema = new mongoose.Schema({
  // ── Identity ───────────────────────────────────────────────────────────────
  name:  { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type:      String,
    required:  [true, 'Email is required'],
    unique:    true,
    lowercase: true,
    trim:      true,
  },
  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: 6,
    select:    false,
  },
  role: {
    type:    String,
    enum:    ['student', 'librarian', 'admin'],
    default: 'student',
  },

  // ── Profile ────────────────────────────────────────────────────────────────
  phone:          { type: String, trim: true },
  studentId:      { type: String, trim: true },
  department:     { type: String, trim: true },
  profilePicture: { type: String, default: '' }, // Cloudinary URL

  // ── Library Activity ───────────────────────────────────────────────────────
  wishlist:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],

  // ── Status & Security ──────────────────────────────────────────────────────
  isActive:             { type: Boolean, default: true },
  resetPasswordToken:   { type: String,  select: false },
  resetPasswordExpires: { type: Date,    select: false },

}, { timestamps: true });

// ── Password Hashing ──────────────────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt   = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance Methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate a password reset token (hex string) and set expiry (1 hour)
userSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken   = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token; // return raw token (sent via email)
};

module.exports = mongoose.model('User', userSchema);
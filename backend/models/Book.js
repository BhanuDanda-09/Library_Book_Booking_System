const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  // ── Core Info ──────────────────────────────────────────────────────────────
  title:    { type: String, required: [true, 'Book title is required'], trim: true },
  subtitle: { type: String, trim: true },
  author:   { type: String, required: [true, 'Author is required'],    trim: true },
  isbn: {
    type:     String,
    required: [true, 'ISBN is required'],
    unique:   true,
    trim:     true,
  },
  description: { type: String, trim: true },
  publisher:   { type: String, trim: true },
  publishedYear: { type: Number },
  edition:     { type: String, trim: true },
  language:    { type: String, default: 'English', trim: true },

  // ── Classification ─────────────────────────────────────────────────────────
  category: {
    type: String,
    required: true,
    trim: true,
    // Legacy string value preserved for backward compat.
    // New records also store the string name from Category collection.
  },
  shelfLocation: { type: String, trim: true }, // e.g. "A3-12"

  // ── Inventory ──────────────────────────────────────────────────────────────
  totalCopies:     { type: Number, required: true, min: 1 },
  availableCopies: { type: Number, required: true, min: 0 },
  reservedCopies:  { type: Number, default: 0, min: 0 },
  issuedCopies:    { type: Number, default: 0, min: 0 },

  // ── Media ──────────────────────────────────────────────────────────────────
  coverImage: { type: String, default: '' }, // Cloudinary URL or local /uploads path

  // ── Stats ──────────────────────────────────────────────────────────────────
  borrowCount: { type: Number, default: 0 }, // for "Most Borrowed" sorting

  // ── Status ─────────────────────────────────────────────────────────────────
  isActive: { type: Boolean, default: true },

}, { timestamps: true });

// Full-text search index
bookSchema.index({ title: 'text', author: 'text', isbn: 'text', publisher: 'text', description: 'text' });
// Performance indexes
bookSchema.index({ category: 1, isActive: 1 });
bookSchema.index({ borrowCount: -1 });
bookSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Book', bookSchema);
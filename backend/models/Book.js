const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology',
           'History', 'Biography', 'Mathematics', 'Arts', 'Philosophy', 'Other'],
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 1,
  },
  availableCopies: {
    type: Number,
    required: true,
  },
  description: { type: String, trim: true },
  publisher:   { type: String, trim: true },
  publishedYear: { type: Number },
  coverImage:  { type: String, default: '' },
  language:    { type: String, default: 'English' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

module.exports = mongoose.model('Book', bookSchema);
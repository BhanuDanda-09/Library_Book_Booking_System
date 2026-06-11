const Book = require('../models/Book');

// GET /api/books
exports.getBooks = async (req, res) => {
  try {
    const { search, category, available, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (search)             query.$text = { $search: search };
    if (category)           query.category = category;
    if (available === 'true') query.availableCopies = { $gt: 0 };

    const skip  = (page - 1) * limit;
    const total = await Book.countDocuments(query);
    const books = await Book.find(query).skip(skip).limit(+limit).sort('-createdAt');

    res.json({ success: true, total, books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/books/:id
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/books  (librarian)
exports.addBook = async (req, res) => {
  try {
    const data = { ...req.body, availableCopies: req.body.totalCopies };
    if (req.file) data.coverImage = `/uploads/${req.file.filename}`;
    const book = await Book.create(data);
    res.status(201).json({ success: true, message: 'Book added!', book });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'ISBN already exists.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/books/:id  (librarian)
exports.updateBook = async (req, res) => {
  try {
    if (req.file) req.body.coverImage = `/uploads/${req.file.filename}`;
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, message: 'Book updated!', book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/books/:id  (librarian — soft delete)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, message: 'Book removed from catalogue.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
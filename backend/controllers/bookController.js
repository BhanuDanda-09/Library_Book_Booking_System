const Book        = require('../models/Book');
const ActivityLog = require('../models/ActivityLog');

// ── GET /api/books ─────────────────────────────────────────────────────────────
exports.getBooks = async (req, res) => {
  try {
    const {
      search, category, available, author, language, publisher,
      sort = '-createdAt',
      page  = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Full-text search
    if (search) query.$text = { $search: search };

    // Filters
    if (category && category !== 'All')  query.category = { $regex: category, $options: 'i' };
    if (author)    query.author   = { $regex: author,    $options: 'i' };
    if (language)  query.language = { $regex: language,  $options: 'i' };
    if (publisher) query.publisher = { $regex: publisher, $options: 'i' };
    if (available === 'true') query.availableCopies = { $gt: 0 };

    // Sort map
    const sortMap = {
      newest:       '-createdAt',
      oldest:       'createdAt',
      az:           'title',
      za:           '-title',
      mostBorrowed: '-borrowCount',
      '-createdAt': '-createdAt',
    };
    const sortKey = sortMap[sort] || sortMap['-createdAt'];

    const skip  = (page - 1) * limit;
    const total = await Book.countDocuments(query);
    const books = await Book.find(query).sort(sortKey).skip(skip).limit(+limit);

    res.json({
      success: true,
      total,
      page:    +page,
      pages:   Math.ceil(total / limit),
      books,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/books/:id ─────────────────────────────────────────────────────────
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }
    res.json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/books/:id/similar ─────────────────────────────────────────────────
exports.getSimilarBooks = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    const similar = await Book.find({
      _id:      { $ne: book._id },
      isActive: true,
      category: book.category,
    }).limit(6).sort('-borrowCount');

    res.json({ success: true, books: similar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/books  (librarian/admin) ─────────────────────────────────────────
exports.addBook = async (req, res) => {
  try {
    const data = { ...req.body, availableCopies: +req.body.totalCopies };

    // Cover image: Cloudinary (req.file.path) or local upload fallback
    if (req.file) {
      data.coverImage = req.file.path || `/uploads/${req.file.filename}`;
    }

    const book = await Book.create(data);

    await ActivityLog.create({
      user:    req.user._id,
      action:  'BOOK_ADDED',
      details: `"${book.title}" by ${book.author} added to catalogue`,
      meta:    { bookId: book._id },
    });

    res.status(201).json({ success: true, message: 'Book added!', book });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'ISBN already exists.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/books/:id  (librarian/admin) ──────────────────────────────────────
exports.updateBook = async (req, res) => {
  try {
    if (req.file) {
      req.body.coverImage = req.file.path || `/uploads/${req.file.filename}`;
    }
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    await ActivityLog.create({
      user:    req.user._id,
      action:  'BOOK_UPDATED',
      details: `"${book.title}" was updated`,
      meta:    { bookId: book._id },
    });

    res.json({ success: true, message: 'Book updated!', book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/books/:id  (librarian/admin — soft delete) ─────────────────────
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

    await ActivityLog.create({
      user:    req.user._id,
      action:  'BOOK_DELETED',
      details: `"${book.title}" removed from catalogue`,
      meta:    { bookId: book._id },
    });

    res.json({ success: true, message: 'Book removed from catalogue.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
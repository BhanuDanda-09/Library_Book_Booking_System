const express = require('express');
const router  = express.Router();
const path    = require('path');
const multer  = require('multer');

const { getBooks, getBook, getSimilarBooks, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect }  = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

// ── Upload Middleware ──────────────────────────────────────────────────────────
// Try Cloudinary storage first; fall back to local disk storage
let upload;
try {
  const { uploadBookCover } = require('../utils/cloudinary');
  upload = uploadBookCover;
} catch {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename:    (req, file, cb) => cb(null, `book-${Date.now()}${path.extname(file.originalname)}`),
  });
  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
}

// ── Routes ────────────────────────────────────────────────────────────────────
router.get('/',           getBooks);
router.get('/:id',        getBook);
router.get('/:id/similar', getSimilarBooks);

router.post('/',    protect, roleAuth('librarian', 'admin'), upload.single('coverImage'), addBook);
router.put('/:id',  protect, roleAuth('librarian', 'admin'), upload.single('coverImage'), updateBook);
router.delete('/:id', protect, roleAuth('librarian', 'admin'), deleteBook);

module.exports = router;
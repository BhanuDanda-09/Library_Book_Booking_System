const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const { getBooks, getBook, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect }   = require('../middleware/auth');
const { roleAuth }  = require('../middleware/roleAuth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'server/uploads/'),
  filename:    (req, file, cb) => cb(null, `book-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/',     getBooks);
router.get('/:id',  getBook);
router.post('/',    protect, roleAuth('librarian'), upload.single('coverImage'), addBook);
router.put('/:id',  protect, roleAuth('librarian'), upload.single('coverImage'), updateBook);
router.delete('/:id', protect, roleAuth('librarian'), deleteBook);

module.exports = router;
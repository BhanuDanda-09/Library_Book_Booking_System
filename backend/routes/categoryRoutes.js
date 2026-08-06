const express = require('express');
const router  = express.Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect }  = require('../middleware/auth');
const { roleAuth } = require('../middleware/roleAuth');

router.get('/',      getCategories);
router.get('/:id',   getCategory);
router.post('/',     protect, roleAuth('librarian', 'admin'), createCategory);
router.put('/:id',   protect, roleAuth('librarian', 'admin'), updateCategory);
router.delete('/:id', protect, roleAuth('librarian', 'admin'), deleteCategory);

module.exports = router;

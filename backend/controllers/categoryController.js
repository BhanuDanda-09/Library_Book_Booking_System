const Category = require('../models/Category');
const Book     = require('../models/Book');

// GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');

    // Enrich with book counts
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const count = await Book.countDocuments({ category: cat.name, isActive: true });
        return { ...cat.toObject(), bookCount: count };
      })
    );

    res.json({ success: true, categories: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/categories/:id
exports.getCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, category: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/categories  (admin/librarian)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const cat = await Category.create({ name, description, icon, color });
    res.status(201).json({ success: true, message: 'Category created!', category: cat });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/categories/:id  (admin/librarian)
exports.updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, message: 'Category updated!', category: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/categories/:id  (admin/librarian)
exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, message: 'Category removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

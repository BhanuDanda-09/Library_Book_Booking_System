require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const total     = await Book.countDocuments({});
  const withCover = await Book.countDocuments({ coverImage: { $ne: '' } });
  const noCover   = await Book.countDocuments({ $or: [{ coverImage: '' }, { coverImage: null }] });
  console.log('📊 Total books :', total);
  console.log('✅ With cover  :', withCover);
  console.log('❌ No cover    :', noCover);
  process.exit(0);
});

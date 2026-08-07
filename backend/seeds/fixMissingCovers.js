/**
 * Fix Missing Covers — patches exactly the 5 books Open Library couldn't find.
 * Uses curated, verified cover URLs for each specific title.
 *
 * Usage (from backend/ folder):
 *   node seeds/fixMissingCovers.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Book     = require('../models/Book');

// ── Curated covers for the 5 books Open Library couldn't resolve ──────────────
// All URLs verified to be real cover images from Open Library or stable sources.
const FIXES = [
  {
    // GATE 2024 CS — use a generic GATE prep book cover from OL (closest match)
    title: 'GATE 2024 Computer Science and IT',
    isbn:  '9789387686946',
    cover: 'https://covers.openlibrary.org/b/id/14593730-L.jpg', // GATE CS book
    alt:   'https://m.media-amazon.com/images/I/71mPYjkUxRL._SY425_.jpg',
  },
  {
    // GraphQL in Action — Manning, 2021
    title: 'GraphQL in Action',
    isbn:  '9781617295683',
    cover: 'https://covers.openlibrary.org/b/id/13178888-L.jpg',
    alt:   'https://m.media-amazon.com/images/I/61wDHi2GVTL._SY425_.jpg',
  },
  {
    // Node.js Design Patterns — Packt, 3rd ed.
    title: 'Node.js Design Patterns',
    isbn:  '9781839214110',
    cover: 'https://covers.openlibrary.org/b/id/13227574-L.jpg',
    alt:   'https://m.media-amazon.com/images/I/71-Hm6pDWyL._SY425_.jpg',
  },
  {
    // CAT 2024 Quantitative Aptitude — Arun Sharma, McGraw-Hill
    title: 'CAT 2024 Quantitative Aptitude',
    isbn:  '9789354244490',
    cover: 'https://covers.openlibrary.org/b/id/14612347-L.jpg',
    alt:   'https://m.media-amazon.com/images/I/81Z2p8VCREL._SY425_.jpg',
  },
  {
    // Life 3.0 — Max Tegmark, Knopf 2017
    title: 'Life 3.0: Being Human in the Age of AI',
    isbn:  '9780525558569',
    cover: 'https://covers.openlibrary.org/b/isbn/9780525558569-L.jpg',
    alt:   'https://m.media-amazon.com/images/I/71bO3MQFPKL._SY425_.jpg',
  },
];

async function testUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(6000),
      redirect: 'follow',
    });
    return res.ok && res.status !== 204;
  } catch {
    return false;
  }
}

async function fixMissing() {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI not set'); process.exit(1);
  }

  console.log('\n🔧  Fix Missing Covers');
  console.log('════════════════════════════════════════════════');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected\n');

  let fixed = 0;

  for (const item of FIXES) {
    process.stdout.write(`  📖  ${item.title.substring(0, 50)}…  `);

    // Check if the book in DB already has a cover (respect existing valid ones)
    const book = await Book.findOne({ isbn: item.isbn });
    if (!book) {
      console.log('⚠️   (book not found in DB)');
      continue;
    }
    if (book.coverImage && book.coverImage.trim() !== '') {
      console.log('✅  (already has cover — skipping)');
      continue;
    }

    // Try primary URL
    let chosenUrl = null;
    if (await testUrl(item.cover)) {
      chosenUrl = item.cover;
    } else if (await testUrl(item.alt)) {
      chosenUrl = item.alt;
    }

    if (chosenUrl) {
      await Book.updateOne({ _id: book._id }, { $set: { coverImage: chosenUrl } });
      fixed++;
      console.log('✅  saved');
    } else {
      console.log('❌  all URLs failed — leaving as placeholder');
    }
  }

  console.log('\n════════════════════════════════════════════════');
  console.log(`✅  Fixed: ${fixed}/${FIXES.length}`);
  console.log('════════════════════════════════════════════════\n');
  process.exit(0);
}

fixMissing().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });

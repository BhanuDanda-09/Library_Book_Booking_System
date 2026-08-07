/**
 * Book Cover Updater  (Open Library edition — no quota limits)
 * ──────────────────────────────────────────────────────────────
 * Queries the Open Library API for every book that has no coverImage,
 * then persists the cover URL back into MongoDB.
 *
 * Usage (from the backend/ folder):
 *   node seeds/updateCovers.js
 *   node seeds/updateCovers.js --force    ← re-process every book
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Book = require('../models/Book');

const FORCE   = process.argv.includes('--force');
const DELAY   = 350; // ~2.8 req/s — polite for Open Library

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Open Library helpers ──────────────────────────────────────────────────────

/** Direct ISBN endpoint — returns cover IDs if the book record exists */
async function fetchByIsbnDirect(isbn) {
  const clean = isbn.replace(/[-\s]/g, '');
  const url   = `https://openlibrary.org/isbn/${clean}.json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!res.ok) return null;
    const data = await res.json();
    const id = data?.covers?.[0];
    return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : null;
  } catch { return null; }
}

/** Open Library Search API — handles editions that aren't in isbn/ endpoint */
async function fetchBySearch(q) {
  const url = `https://openlibrary.org/search.json?${q}&fields=cover_i&limit=1`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!res.ok) return null;
    const data = await res.json();
    const id = data?.docs?.[0]?.cover_i;
    return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : null;
  } catch { return null; }
}

/** Coordinates up to 4 search strategies for one book */
async function fetchCoverUrl(isbn, title, author) {
  const clean = isbn ? isbn.replace(/[-\s]/g, '') : '';

  // 1. ISBN direct lookup (fastest — returns specific edition data)
  if (clean) {
    const url = await fetchByIsbnDirect(clean);
    if (url) return url;
    await sleep(150);
  }

  // 2. Search by ISBN
  if (clean) {
    const url = await fetchBySearch(`isbn=${clean}`);
    if (url) return url;
    await sleep(150);
  }

  // 3. Search by title + first author last-name
  if (title) {
    const lastName = author
      ? (author.split(',')[0].trim().split(' ').pop() || '')
      : '';
    const q = `q=${encodeURIComponent(title + (lastName ? ` ${lastName}` : ''))}`;
    const url = await fetchBySearch(q);
    if (url) return url;
    await sleep(150);
  }

  // 4. Title-only search
  if (title) {
    const url = await fetchBySearch(`q=${encodeURIComponent(title)}`);
    if (url) return url;
  }

  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function updateCovers() {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI not set in .env'); process.exit(1);
  }

  console.log('\n📚  Book Cover Updater  (via Open Library)');
  console.log('════════════════════════════════════════════════');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB\n');

  const filter = FORCE
    ? {}
    : { $or: [{ coverImage: '' }, { coverImage: null }, { coverImage: { $exists: false } }] };

  const books  = await Book.find(filter).lean();
  console.log(`📖  ${books.length} book(s) to process${FORCE ? '  (--force)' : ''}\n`);

  let ok = 0, miss = 0;

  for (let i = 0; i < books.length; i++) {
    const b      = books[i];
    const label  = `[${String(i + 1).padStart(3, ' ')}/${books.length}]`;
    const title  = (b.title || '').substring(0, 44).padEnd(44, ' ');
    process.stdout.write(`  ${label}  ${title}  `);

    const url = await fetchCoverUrl(b.isbn, b.title, b.author);
    if (url) {
      await Book.updateOne({ _id: b._id }, { $set: { coverImage: url } });
      ok++;
      console.log('✅');
    } else {
      miss++;
      console.log('⚠️   (no cover found)');
    }

    await sleep(DELAY);
  }

  console.log('\n════════════════════════════════════════════════');
  console.log(`✅  Updated  : ${ok}`);
  console.log(`⚠️   Not found: ${miss}`);
  console.log(`📊  Total    : ${books.length}`);
  console.log('════════════════════════════════════════════════\n');
  process.exit(0);
}

updateCovers().catch((e) => { console.error('❌ Fatal:', e.message); process.exit(1); });

/**
 * fixUnverifiedBooks.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Handles the 28 books that Open Library couldn't verify by ISBN.
 * These books currently have WRONG covers from a previous title-search run.
 *
 * Strategy (ISBN-STRICT — no title search):
 *   1. Google Books API by ISBN  → authoritative, uses daily quota
 *   2. Google Books embed URL    → direct image, no API quota
 *   3. CLEAR to '' if nothing found → shows gradient placeholder (safe!)
 *
 * Usage (from backend/ folder):
 *   node seeds/fixUnverifiedBooks.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Book     = require('../models/Book');

const DELAY = 500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Unverified ISBNs from the dry-run report ──────────────────────────────────
// These books had no OL ISBN-direct cover, so their stored coverImage is WRONG
// (obtained from an unsafe title-search that matched unrelated books).
const UNVERIFIED_ISBNS = [
  '9780071333634', // Financial Management
  '9780134741000', // Human Resource Management
  '9789387686946', // GATE 2024 Computer Science and IT
  '9781617295683', // GraphQL in Action
  '9781617296512', // Grokking Artificial Intelligence Algorithms
  '9781492077442', // SQL Cookbook
  '9781491904220', // You Don't Know JS: Scope and Closures
  '9780525558552', // Human Compatible
  '9780061935466', // To Kill a Mockingbird
  '9781617294327', // Docker in Practice
  '9781492081401', // Programming the Internet of Things
  '9788129135476', // Five Point Someone
  '9781506264837', // Barron's GRE
  '9781260463419', // Java: The Complete Reference
  '9781118212431', // Advanced Engineering Mathematics
  '9789352039913', // Objective General English
  '9781839214110', // Node.js Design Patterns
  '9789354244490', // CAT 2024 Quantitative Aptitude
  '9789386052162', // Let Us C
  '9781999858506', // The Hundred-Page Machine Learning Book
  '9789382416036', // Strength of Materials
  '9789385769146', // Higher Engineering Mathematics
  '9780195888188', // The Problems of Philosophy
  '9780525558569', // Life 3.0: Being Human in the Age of AI
  '9789352534449', // A Modern Approach to Verbal and Non-Verbal Reasoning
  '9789352600397', // UPSC Civil Services Examination Guide
  '9781119800330', // Operating System Concepts
  '9780671741854', // Word Power Made Easy
];

// ── Google Books API (uses daily quota — only 28 calls) ───────────────────────
async function fetchGoogleApiCover(isbn) {
  const clean = isbn.replace(/[-\s]/g, '');
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}&maxResults=1&fields=items(volumeInfo/imageLinks)`,
      { signal: AbortSignal.timeout(9000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) {
      console.warn(`\n    ⚠️  Google API error: ${data.error.message}`);
      return null;
    }
    const links = data?.items?.[0]?.volumeInfo?.imageLinks;
    if (!links) return null;
    const url = links.extraLarge || links.large || links.medium || links.thumbnail;
    return url ? url.replace('http:', 'https:').replace(/zoom=\d/, 'zoom=3') : null;
  } catch { return null; }
}

// ── Google Books embed URL — direct image, no quota ───────────────────────────
// Returns a URL that *might* be a real cover or a small "no-preview" placeholder.
// We check content-length to distinguish real covers from placeholders.
async function fetchGoogleEmbedCover(isbn) {
  const clean = isbn.replace(/[-\s]/g, '');
  const url = `https://books.google.com/books/content?vid=ISBN:${clean}&printsec=frontcover&img=1&zoom=3&source=gbs_api`;
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const cl = parseInt(res.headers.get('content-length') ?? '0', 10);
    // Google's "no preview" placeholder is ~1-5KB; real covers are usually >5KB
    return cl > 5000 ? url : null;
  } catch { return null; }
}

// ── Open Library search by ISBN (API call, different from direct cover URL) ───
async function fetchOLIsbnSearchCover(isbn) {
  const clean = isbn.replace(/[-\s]/g, '');
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?isbn=${clean}&fields=cover_i&limit=1`,
      { signal: AbortSignal.timeout(9000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const id = data?.docs?.[0]?.cover_i;
    if (!id) return null;
    const coverUrl = `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
    // Verify it loads
    const chk = await fetch(coverUrl, { method: 'HEAD', signal: AbortSignal.timeout(6000) });
    return chk.ok ? coverUrl : null;
  } catch { return null; }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function fixUnverified() {
  if (!process.env.MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

  console.log('\n🔧  Fix Unverified Books (28 books — ISBN-only, no title search)');
  console.log('════════════════════════════════════════════════════════════════');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected\n');

  const stats = { fixed: 0, cleared: 0 };

  for (const isbn of UNVERIFIED_ISBNS) {
    const book = await Book.findOne({ isbn }).lean();
    if (!book) {
      console.log(`  ⚠️  ISBN ${isbn} not found in DB — skipping`);
      continue;
    }

    const short = (book.title || '').substring(0, 48).padEnd(48, ' ');
    process.stdout.write(`  📖  ${short}  `);

    let coverUrl = null;

    // 1. Google Books API by ISBN (authoritative)
    coverUrl = await fetchGoogleApiCover(isbn);
    if (coverUrl) { process.stdout.write('Google API '); }
    await sleep(200);

    // 2. Google Books embed URL (no API quota)
    if (!coverUrl) {
      coverUrl = await fetchGoogleEmbedCover(isbn);
      if (coverUrl) { process.stdout.write('Google embed '); }
      await sleep(200);
    }

    // 3. Open Library search by ISBN (fresh attempt)
    if (!coverUrl) {
      coverUrl = await fetchOLIsbnSearchCover(isbn);
      if (coverUrl) { process.stdout.write('OL search '); }
      await sleep(200);
    }

    if (coverUrl) {
      await Book.updateOne({ _id: book._id }, { $set: { coverImage: coverUrl } });
      stats.fixed++;
      console.log('✅');
    } else {
      // CLEAR the wrong title-search cover → gradient placeholder is safer
      await Book.updateOne({ _id: book._id }, { $set: { coverImage: '' } });
      stats.cleared++;
      console.log('🗑️   cleared (no ISBN cover found — will show gradient placeholder)');
    }

    await sleep(DELAY);
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`✅  Fixed with real cover : ${stats.fixed}`);
  console.log(`🗑️   Cleared (placeholder) : ${stats.cleared}`);
  console.log('════════════════════════════════════════════════════════════════\n');
  process.exit(0);
}

fixUnverified().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });

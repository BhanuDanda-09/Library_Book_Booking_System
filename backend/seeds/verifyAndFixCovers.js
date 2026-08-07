/**
 * verifyAndFixCovers.js
 * ───────────────────────────────────────────────────────────────────────────
 * Audits every book in MongoDB to ensure the stored coverImage actually
 * belongs to that specific ISBN / title / author.
 *
 * Strategy (in priority order):
 *   1. Direct ISBN cover  → covers.openlibrary.org/b/isbn/{isbn}-L.jpg
 *      This is authoritative: if OL has a cover for that exact ISBN, use it.
 *   2. OL ISBN record     → openlibrary.org/isbn/{isbn}.json  → cover ids[]
 *   3. OL ISBN search     → search.json?isbn={isbn} → cover_i
 *   4. If none of the above works: keep current cover, mark as "unverified"
 *
 * Reports:
 *   ✅ VERIFIED  – ISBN-direct cover confirmed
 *   🔄 UPDATED   – replaced potentially-wrong title-search cover with ISBN cover
 *   ⚠️  UNVERIFIED – no ISBN cover found; current cover kept (manual review)
 *   ❌ DUPLICATE – same cover URL shared by 2+ unrelated books (need manual fix)
 *
 * Usage (from backend/ folder):
 *   node seeds/verifyAndFixCovers.js
 *   node seeds/verifyAndFixCovers.js --dry-run   ← report only, no DB writes
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Book     = require('../models/Book');

const DRY_RUN = process.argv.includes('--dry-run');
const DELAY   = 400; // ms between requests — polite rate limiting
const sleep   = (ms) => new Promise((r) => setTimeout(r, ms));

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function headOk(url) {
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(7000),
      redirect: 'follow',
    });
    // 200 OK and content-length > 0 (OL returns content-length for real images)
    return r.ok && (r.headers.get('content-length') ?? '1') !== '0';
  } catch { return false; }
}

async function fetchJson(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

// ── Cover resolution strictly by ISBN ────────────────────────────────────────

async function resolveByIsbn(isbn) {
  const clean = isbn.replace(/[-\s]/g, '');

  // 1. Direct ISBN cover URL — fastest, most reliable
  const directUrl = `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg?default=false`;
  if (await headOk(directUrl)) {
    return directUrl;
  }
  await sleep(150);

  // 2. OL ISBN book record → covers[]
  const bookRecord = await fetchJson(`https://openlibrary.org/isbn/${clean}.json`);
  if (bookRecord?.covers?.length) {
    const id  = bookRecord.covers[0];
    const url = `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
    if (await headOk(url)) return url;
  }
  await sleep(150);

  // 3. OL search by ISBN → cover_i
  const search = await fetchJson(
    `https://openlibrary.org/search.json?isbn=${clean}&fields=cover_i,title&limit=1`
  );
  const coverId = search?.docs?.[0]?.cover_i;
  if (coverId) {
    const url = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    if (await headOk(url)) return url;
  }

  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function verify() {
  if (!process.env.MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

  console.log(`\n🔍  Book Cover Verifier${DRY_RUN ? '  [DRY-RUN — no DB writes]' : ''}`);
  console.log('════════════════════════════════════════════════════════════════');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB\n');

  const books = await Book.find({}).lean();
  console.log(`📖  Auditing ${books.length} books…\n`);

  const stats    = { verified: 0, updated: 0, unverified: 0 };
  const changes  = [];   // [{ title, old, new }]
  const unverif  = [];   // [{ title, isbn, currentCover }]

  for (let i = 0; i < books.length; i++) {
    const b     = books[i];
    const label = `[${String(i + 1).padStart(3, ' ')}/${books.length}]`;
    const short = (b.title || '').substring(0, 44).padEnd(44, ' ');
    process.stdout.write(`  ${label}  ${short}  `);

    if (!b.isbn) {
      console.log('⚠️   (no ISBN — skip)');
      stats.unverified++;
      unverif.push({ title: b.title, isbn: 'none', currentCover: b.coverImage });
      continue;
    }

    const isbnCover = await resolveByIsbn(b.isbn);

    if (isbnCover) {
      // We have a ground-truth ISBN cover
      if (b.coverImage === isbnCover) {
        // Already identical — correct and verified
        console.log('✅  verified');
        stats.verified++;
      } else {
        // Current cover differs from ISBN-verified cover → update
        console.log(`🔄  updated`);
        stats.updated++;
        changes.push({ title: b.title, old: b.coverImage || '(empty)', new: isbnCover });
        if (!DRY_RUN) {
          await Book.updateOne({ _id: b._id }, { $set: { coverImage: isbnCover } });
        }
      }
    } else {
      // No ISBN cover found — keep current cover but flag as unverified
      process.stdout.write('⚠️   unverified');
      if (!b.coverImage) process.stdout.write(' (empty)');
      console.log('');
      stats.unverified++;
      unverif.push({ title: b.title, isbn: b.isbn, currentCover: b.coverImage });
    }

    await sleep(DELAY);
  }

  // ── Duplicate detection ───────────────────────────────────────────────────
  console.log('\n🔎  Checking for duplicate cover URLs across different books…');
  const allBooks  = await Book.find({ coverImage: { $ne: '' } }, 'title coverImage').lean();
  const coverMap  = {};
  for (const b of allBooks) {
    if (!b.coverImage) continue;
    if (!coverMap[b.coverImage]) coverMap[b.coverImage] = [];
    coverMap[b.coverImage].push(b.title);
  }
  const dupes = Object.entries(coverMap).filter(([, titles]) => titles.length > 1);

  // ── Report ────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`✅  Verified   : ${stats.verified}`);
  console.log(`🔄  Updated    : ${stats.updated}${DRY_RUN ? ' (dry-run — not written)' : ''}`);
  console.log(`⚠️   Unverified : ${stats.unverified}`);
  console.log(`❌  Duplicates : ${dupes.length} URL(s) shared by multiple books`);
  console.log('════════════════════════════════════════════════════════════════');

  if (changes.length) {
    console.log('\n📝  Updated covers:');
    for (const c of changes) {
      console.log(`  • ${c.title}`);
      console.log(`    Old: ${c.old.substring(0, 80)}`);
      console.log(`    New: ${c.new.substring(0, 80)}`);
    }
  }

  if (unverif.length) {
    console.log('\n⚠️   Unverified (kept current cover):');
    for (const u of unverif) {
      console.log(`  • ${u.title}  [ISBN: ${u.isbn}]`);
    }
  }

  if (dupes.length) {
    console.log('\n❌  Duplicate cover URLs (same image on 2+ books):');
    for (const [url, titles] of dupes) {
      console.log(`  URL: ${url.substring(0, 70)}`);
      for (const t of titles) console.log(`    → ${t}`);
    }
  }

  console.log('');
  process.exit(0);
}

verify().catch((e) => { console.error('Fatal:', e.message); process.exit(1); });

import { useState, useEffect, useRef } from "react";
import "./BookCover.css";

// ── Category gradient palette ─────────────────────────────────────────────────
const PALETTE = {
  "Fiction":                 ["#667eea", "#764ba2"],
  "Non-Fiction":             ["#f093fb", "#f5576c"],
  "Science":                 ["#4facfe", "#00f2fe"],
  "Technology":              ["#11998e", "#38ef7d"],
  "Programming":             ["#fc5c7d", "#6a3093"],
  "Mathematics":             ["#a18cd1", "#fbc2eb"],
  "History":                 ["#c94b4b", "#4b134f"],
  "Biography":               ["#2193b0", "#6dd5ed"],
  "Philosophy":              ["#536976", "#292e49"],
  "Arts":                    ["#fd746c", "#ff9068"],
  "Machine Learning":        ["#4776e6", "#8e54e9"],
  "Artificial Intelligence": ["#0f0c29", "#302b63"],
  "Computer Science":        ["#1a1a2e", "#16213e"],
  "Data Science":            ["#093028", "#237a57"],
  "Web Development":         ["#06b6d4", "#0284c7"],
  "Databases":               ["#14b8a6", "#0f766e"],
  "Networking":              ["#22c55e", "#15803d"],
  "Cyber Security":          ["#ef4444", "#991b1b"],
  "Cloud Computing":         ["#f59e0b", "#b45309"],
  "Engineering":             ["#f97316", "#c2410c"],
  "Management":              ["#84cc16", "#4d7c0f"],
  "Literature":              ["#d946ef", "#a21caf"],
  "Psychology":              ["#fb923c", "#c2410c"],
  "Competitive Exams":       ["#0ea5e9", "#0369a1"],
  "Other":                   ["#373b44", "#4286f4"],
  _default:                  ["#6366f1", "#8b5cf6"],
};

// ── ISBN-only URL builders (no title search — prevents wrong-book covers) ──────

/** Open Library direct ISBN cover. Returns 404 (not a placeholder) if no cover. */
function olIsbnUrl(isbn) {
  if (!isbn) return null;
  const c = isbn.replace(/[-\s]/g, "");
  return `https://covers.openlibrary.org/b/isbn/${c}-L.jpg?default=false`;
}

/** Google Books embed URL — ISBN-specific, no API quota. */
function googleEmbedUrl(isbn) {
  if (!isbn) return null;
  const c = isbn.replace(/[-\s]/g, "");
  return `https://books.google.com/books/content?vid=ISBN:${c}&printsec=frontcover&img=1&zoom=3&source=gbs_api`;
}

/**
 * Open Library ISBN search — async, returns a verified cover URL or null.
 * Uses ONLY the isbn= param. NO title search — prevents returning wrong books.
 */
async function fetchOLIsbnCover(isbn) {
  if (!isbn) return null;
  const clean = isbn.replace(/[-\s]/g, "");
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?isbn=${clean}&fields=cover_i&limit=1`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const id = data?.docs?.[0]?.cover_i;
    return id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : null;
  } catch {
    return null;
  }
}

// ── State machine ─────────────────────────────────────────────────────────────
// "image"       → currently showing an image (direct src list)
// "loading"     → async fetch in progress → show shimmer
// "placeholder" → all sources exhausted → show gradient

/**
 * BookCover
 *
 * IMPORTANT — all fallbacks are ISBN-strict.
 * Title-based search has been intentionally removed to prevent
 * a wrong book's cover appearing (e.g. "Hell Bent" for "CAT 2024").
 *
 * Priority chain:
 *   1. book.coverImage  (DB-stored, verified URL)
 *   2. Open Library direct ISBN URL (fast, no API, 404 on miss)
 *   3. Google Books embed URL (ISBN-specific, no quota)
 *   4. Open Library ISBN search API (async, ISBN only)
 *   5. Gradient category placeholder
 */
export default function BookCover({
  book,
  imgClassName,
  className = "",
  style,
  onClick,
}) {
  const hasRealCover =
    book?.coverImage &&
    book.coverImage.trim() !== "" &&
    !book.coverImage.includes("picsum.photos");

  const hasIsbn = !!book?.isbn;

  // Build ordered direct-source list (tried sequentially via onError)
  const sourcesRef = useRef(null);
  if (!sourcesRef.current) {
    const list = [];
    if (hasRealCover) list.push(book.coverImage);
    if (hasIsbn) {
      list.push(olIsbnUrl(book.isbn));
      list.push(googleEmbedUrl(book.isbn));
    }
    sourcesRef.current = list;
  }

  const [srcIndex, setSrcIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(sourcesRef.current[0] ?? null);
  const [state, setState]       = useState(
    sourcesRef.current.length > 0 ? "image" : "loading"
  );
  const asyncFiredRef = useRef(false);

  // For books with no direct sources, kick off async OL ISBN search on mount
  useEffect(() => {
    if (sourcesRef.current.length === 0 && !asyncFiredRef.current) {
      asyncFiredRef.current = true;
      fetchOLIsbnCover(book?.isbn).then((url) => {
        if (url) { setImageSrc(url); setState("image"); }
        else      { setState("placeholder"); }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle img onError — try next direct source, then async, then placeholder
  const handleError = () => {
    const next = srcIndex + 1;
    if (next < sourcesRef.current.length) {
      setSrcIndex(next);
      setImageSrc(sourcesRef.current[next]);
      return;
    }

    // All direct sources exhausted → try async OL ISBN search
    if (!asyncFiredRef.current) {
      asyncFiredRef.current = true;
      setState("loading");
      fetchOLIsbnCover(book?.isbn).then((url) => {
        if (url) { setImageSrc(url); setState("image"); }
        else      { setState("placeholder"); }
      });
    } else {
      setState("placeholder");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const colors = PALETTE[book?.category] || PALETTE._default;

  if (state === "placeholder") {
    return (
      <div
        className={`bk-placeholder ${className}`}
        style={{ background: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})`, ...style }}
        onClick={onClick}
      >
        <div className="bk-ph-spine" />
        <div className="bk-ph-body">
          <span className="bk-ph-icon">📖</span>
          <p className="bk-ph-title">{book?.title || "Unknown Title"}</p>
          {book?.author && <p className="bk-ph-author">{book.author}</p>}
        </div>
        <span className="bk-ph-label">No Cover</span>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className={`bk-shimmer-wrap ${className}`} style={style} onClick={onClick}>
        <div className="bk-shimmer" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={book?.title || "Book cover"}
      className={imgClassName}
      style={style}
      loading="lazy"
      decoding="async"
      onError={handleError}
      onClick={onClick}
    />
  );
}

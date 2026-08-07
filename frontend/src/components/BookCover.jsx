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

// ── Cover URL builders (no API call needed) ───────────────────────────────────
function openLibraryUrl(isbn) {
  if (!isbn) return null;
  const c = isbn.replace(/[-\s]/g, "");
  return `https://covers.openlibrary.org/b/isbn/${c}-L.jpg?default=false`;
}

// ── Open Library Search API (async, free, no quota) ──────────────────────────
async function fetchOpenLibraryCover(isbn, title, author) {
  const olCoverUrl = (id) =>
    id ? `https://covers.openlibrary.org/b/id/${id}-L.jpg` : null;

  const searchOL = async (params) => {
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?${params}&fields=cover_i&limit=1`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return olCoverUrl(data?.docs?.[0]?.cover_i);
    } catch {
      return null;
    }
  };

  // 1. ISBN search (most precise)
  if (isbn) {
    const clean = isbn.replace(/[-\s]/g, "");
    const url = await searchOL(`isbn=${clean}`);
    if (url) return url;
  }

  // 2. Title + author
  if (title) {
    const lastName = author
      ? (author.split(",")[0].trim().split(" ").pop() || "")
      : "";
    const q = encodeURIComponent(title + (lastName ? ` ${lastName}` : ""));
    const url = await searchOL(`q=${q}`);
    if (url) return url;
  }

  // 3. Title-only
  if (title) {
    const url = await searchOL(`q=${encodeURIComponent(title)}`);
    if (url) return url;
  }

  return null;
}

// ── STATES ─────────────────────────────────────────────────────────────
// "loading"   → shimmer, trying Open Library + Google Books in parallel
// "image"     → we have a working image src
// "error"     → img load failed → try next source
// "fallback"  → all sources exhausted → gradient placeholder

/**
 * BookCover
 *
 * Priority chain:
 *   1. book.coverImage  (Cloudinary or any DB-stored URL)
 *   2. Open Library     (direct img URL, no API call, fast)
 *   3. Google Books API (async search by ISBN → title → title+author)
 *   4. Gradient placeholder
 */
export default function BookCover({
  book,
  imgClassName,
  className = "",
  style,
  onClick,
}) {
  // Determine initial state
  const hasRealCover =
    book?.coverImage &&
    book.coverImage.trim() !== "" &&
    !book.coverImage.includes("picsum.photos");

  const hasIsbn = !!book?.isbn;

  // Build ordered source list
  const sourcesRef = useRef(null);
  if (!sourcesRef.current) {
    const list = [];
    if (hasRealCover) list.push({ type: "direct", src: book.coverImage });
    if (hasIsbn)      list.push({ type: "direct", src: openLibraryUrl(book.isbn) });
    // Google Books is async — handled separately
    sourcesRef.current = list;
  }

  const [srcIndex,       setSrcIndex]       = useState(0);
  const [imageSrc,       setImageSrc]       = useState(sourcesRef.current[0]?.src ?? null);
  const [state,          setState]          = useState(
    sourcesRef.current.length > 0 ? "image" : "loading"
  );
  const googleFiredRef = useRef(false);

  // Kick off Google Books fetch if needed on mount
  useEffect(() => {
    if (sourcesRef.current.length === 0 && !googleFiredRef.current) {
      googleFiredRef.current = true;
      fetchOpenLibraryCover(book?.isbn, book?.title, book?.author).then((url) => {
        if (url) {
          setImageSrc(url);
          setState("image");
        } else {
          setState("placeholder");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle img onError — advance to next source
  const handleError = () => {
    const next = srcIndex + 1;
    if (next < sourcesRef.current.length) {
      setSrcIndex(next);
      setImageSrc(sourcesRef.current[next].src);
      return;
    }

    // No more direct sources — try Google Books asynchronously
    if (!googleFiredRef.current) {
      googleFiredRef.current = true;
      setState("loading");
      fetchOpenLibraryCover(book?.isbn, book?.title, book?.author).then((url) => {
        if (url) {
          setImageSrc(url);
          setState("image");
        } else {
          setState("placeholder");
        }
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

  // state === "image"
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

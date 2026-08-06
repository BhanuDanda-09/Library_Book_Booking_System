import { useState, useEffect, useRef } from "react";
import "./BookCover.css";

// ── Open Library Covers API (free, no key needed) ─────────────────────────────
function getOpenLibraryUrl(isbn) {
  if (!isbn) return null;
  const clean = isbn.replace(/[-\s]/g, "");
  // ?default=false → returns 404 instead of a 1×1 blank gif when no cover exists
  return `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg?default=false`;
}

// ── Google Books API (free tier, no key for basic queries) ────────────────────
async function fetchGoogleBooksCover(isbn, title, author) {
  try {
    let q;
    if (isbn) {
      q = `isbn:${isbn.replace(/[-\s]/g, "")}`;
    } else {
      q = `intitle:${encodeURIComponent(title || "")}`;
      if (author) q += `+inauthor:${encodeURIComponent(author.split(",")[0].trim())}`;
    }

    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items/volumeInfo/imageLinks`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const links = data?.items?.[0]?.volumeInfo?.imageLinks;
    if (!links) return null;

    // Prefer highest resolution available
    const url =
      links.extraLarge ||
      links.large      ||
      links.medium     ||
      links.small      ||
      links.thumbnail;
    // Force HTTPS and boost zoom for better resolution
    return url?.replace("http:", "https:").replace(/zoom=\d/, "zoom=3") || null;
  } catch {
    return null;
  }
}

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
  // ── New categories matching the seeded data ──────────────────────────────────
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

// ── BookCover Component ───────────────────────────────────────────────────────
/**
 * Smart book cover with 3-stage fallback:
 *   1. book.coverImage (Cloudinary or any real URL)
 *   2. Open Library by ISBN
 *   3. Google Books by ISBN / title+author
 *   4. Styled gradient placeholder
 */
export default function BookCover({ book, imgClassName, className = "", style, onClick }) {
  const hasRealCover =
    book?.coverImage &&
    !book.coverImage.includes("picsum.photos") &&
    book.coverImage.trim() !== "";

  const hasIsbn = !!book?.isbn;

  const initStage = hasRealCover ? "custom" : hasIsbn ? "openLibrary" : "google";
  const initSrc   = hasRealCover
    ? book.coverImage
    : hasIsbn
    ? getOpenLibraryUrl(book.isbn)
    : null;

  const [src,             setSrc]             = useState(initSrc);
  const [stage,           setStage]           = useState(initStage);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [fetching,        setFetching]        = useState(false);
  const googleFetchedRef                      = useRef(false);

  // If no isbn and no real cover, go straight to Google
  useEffect(() => {
    if (initStage === "google" && !googleFetchedRef.current) {
      googleFetchedRef.current = true;
      tryGoogle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryGoogle = async () => {
    setFetching(true);
    const url = await fetchGoogleBooksCover(book?.isbn, book?.title, book?.author);
    setFetching(false);
    if (url) {
      setSrc(url);
      setStage("googleResult");
    } else {
      setShowPlaceholder(true);
    }
  };

  const handleError = async () => {
    if (stage === "custom") {
      if (hasIsbn) {
        setStage("openLibrary");
        setSrc(getOpenLibraryUrl(book.isbn));
        return;
      }
    }
    if (stage === "openLibrary" || (stage === "custom" && !hasIsbn)) {
      if (!googleFetchedRef.current) {
        googleFetchedRef.current = true;
        setStage("google");
        await tryGoogle();
        return;
      }
    }
    setShowPlaceholder(true);
  };

  const colors = PALETTE[book?.category] || PALETTE._default;

  // Placeholder
  if (showPlaceholder || (!src && !fetching)) {
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

  // Shimmer loading
  if (fetching) {
    return (
      <div className={`bk-shimmer-wrap ${className}`} style={style} onClick={onClick}>
        <div className="bk-shimmer" />
      </div>
    );
  }

  // Actual image
  return (
    <img
      src={src}
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

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import BookCard from "../components/BookCard";
import "./Home.css";

const FEATURES = [
  { icon: "🔍", title: "Smart Search", desc: "Find books by title, author, ISBN, publisher, or category instantly." },
  { icon: "📅", title: "Easy Reservation", desc: "Reserve books online — librarians approve and prepare your copy." },
  { icon: "🔔", title: "Due Reminders", desc: "Get notified before your due date. Renew books up to 2 times." },
  { icon: "📊", title: "Track Everything", desc: "View your borrow history, active loans, wishlist, and fines in one place." },
];

const STATS = [
  { value: "88+",  label: "Books",      icon: "📚" },
  { value: "15",   label: "Categories", icon: "🏷️"  },
  { value: "25+",  label: "Members",    icon: "👥"  },
  { value: "14",   label: "Day Loans",  icon: "📅"  },
];

export default function Home() {
  const { books, isLoadingBooks, fetchBooks, fetchCategories } = useLibrary();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks({ limit: 8 });
    fetchCategories();
  }, [fetchBooks, fetchCategories]);

  const newArrivals = books.slice(0, 8);

  const handleCTA = () => {
    if (!isAuthenticated) return navigate("/catalog");
    navigate(user.role === "librarian" || user.role === "admin" ? "/dashboard" : "/catalog");
  };

  return (
    <div className="home-page">
      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-orbs">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>
        <div className="hero-content animate-fadeInUp">
          <div className="hero-eyebrow">📚 Your Digital Library</div>
          <h1 className="hero-title">
            Discover Your Next
            <span className="hero-title-accent"> Great Read</span>
          </h1>
          <p className="hero-subtitle">
            Browse 88+ books, reserve in seconds, and enjoy a seamless library experience.
            From programming classics to timeless fiction — everything in one place.
          </p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={handleCTA}>Browse Catalog</button>
            <button className="hero-btn-secondary" onClick={() => navigate(isAuthenticated ? "/my-bookings" : "/register")}>
              {isAuthenticated ? "My Bookings" : "Join Free →"}
            </button>
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="hero-stats">
          {STATS.map(s => (
            <div key={s.label} className="hero-stat-card">
              <span className="hero-stat-icon">{s.icon}</span>
              <div>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── New Arrivals ────────────────────────────────────────────────── */}
      <section className="home-section">
        <div className="page-wrapper">
          <div className="section-header">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-sub">Recently added books to our collection</p>
            </div>
            <button className="section-link" onClick={() => navigate("/catalog")}>
              View all books →
            </button>
          </div>

          {isLoadingBooks ? (
            <div className="books-skeleton-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="book-skeleton">
                  <div className="skeleton" style={{ aspectRatio: "400/560", borderRadius: "12px" }} />
                  <div className="skeleton" style={{ height: 14, marginTop: 12, borderRadius: 6 }} />
                  <div className="skeleton" style={{ height: 12, marginTop: 8, width: "70%", borderRadius: 6 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="books-grid">
              {newArrivals.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="home-features">
        <div className="page-wrapper">
          <div className="section-header centered">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-sub">A complete library experience built for the modern reader</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section className="home-section how-it-works">
        <div className="page-wrapper">
          <div className="section-header centered">
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">Three simple steps to get your next book</p>
          </div>
          <div className="steps-grid">
            {[
              { step: "1", icon: "🔍", title: "Search & Discover", desc: "Browse our catalog by title, author, category, or use the smart search to find exactly what you want." },
              { step: "2", icon: "📋", title: "Reserve Online", desc: "Click Reserve on any available book. The librarian will approve your request and prepare your copy." },
              { step: "3", icon: "✅", title: "Pick Up & Enjoy", desc: "Get notified when approved. Pick up at the desk and enjoy for up to 14 days. Renew anytime!" },
            ].map(s => (
              <div key={s.step} className="step-card">
                <div className="step-number">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="cta-banner">
          <div className="page-wrapper">
            <div className="cta-content">
              <h2 className="cta-title">Ready to start reading?</h2>
              <p className="cta-sub">Join SmartLibrary today and access 88+ books for free.</p>
              <div className="cta-actions">
                <button className="cta-btn-primary" onClick={() => navigate("/register")}>Create Free Account</button>
                <button className="cta-btn-secondary" onClick={() => navigate("/catalog")}>Browse First</button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
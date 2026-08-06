import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { Tag, Tooltip, Modal } from "antd";
import { HeartOutlined, HeartFilled, ArrowLeftOutlined, BookOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import BookCard from "../components/BookCard";
import BookCover from "../components/BookCover";
import API from "../services/api";
import toast from "react-hot-toast";
import "./BookDetail.css";


const statusColor = { pending: "gold", approved: "blue", issued: "purple", returned: "green", cancelled: "red", overdue: "volcano" };

export default function BookDetail() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { isAuthenticated, isStudent, isStaff, user } = useAuth();
  const { createReservation, wishlist, toggleWishlist, trackRecentlyViewed, deleteBook } = useLibrary();

  const [book,    setBook]    = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  const inWishlist = wishlist?.some(w => (w._id || w) === id);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [bookRes, simRes] = await Promise.all([
          API.get(`/books/${id}`),
          API.get(`/books/${id}/similar`),
        ]);
        if (bookRes.data.success) {
          setBook(bookRes.data.book);
          if (isAuthenticated) trackRecentlyViewed(id);
        }
        if (simRes.data.success) setSimilar(simRes.data.books);
      } catch {
        toast.error("Book not found.");
        navigate("/catalog");
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo({ top: 0 });
  }, [id]);

  const handleReserve = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setReserving(true);
    await createReservation(id);
    setReserving(false);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    toggleWishlist(id);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete this book?",
      content: "This action is permanent and cannot be undone. All associated reservations may be affected.",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        const res = await deleteBook(id);
        if (res?.success) navigate("/dashboard");
      },
    });
  };

  if (loading) return (
    <div className="book-detail-page page-wrapper">
      <div className="book-detail-skeleton">
        <div className="skeleton" style={{ width: 280, aspectRatio: "400/560", borderRadius: 14 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 36, width: "70%", borderRadius: 8, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 20, width: "40%", borderRadius: 6, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: "30%", borderRadius: 6, marginBottom: 32 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 10, marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 48, width: 200, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );

  if (!book) return null;

  const available = book.availableCopies > 0;

  return (
    <div className="book-detail-page animate-fadeInUp">
      <div className="page-wrapper">
        {/* Back btn */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Back
        </button>

        {/* Main detail card */}
        <div className="book-detail-card">
          {/* Cover */}
          <div className="book-detail-cover-wrap">
            <BookCover
              book={book}
              imgClassName="book-detail-cover"
              className="book-detail-cover-ph"
            />
            <div className={`book-detail-avail-badge ${available ? "avail" : "unavail"}`}>
              {available ? `✓ ${book.availableCopies} Available` : "✗ Unavailable"}
            </div>
          </div>

          {/* Info */}
          <div className="book-detail-info">
            <div className="book-detail-cats">
              <Tag color="purple">{book.category}</Tag>
              {book.language && <Tag>{book.language}</Tag>}
              {book.edition  && <Tag>Edition: {book.edition}</Tag>}
            </div>

            <h1 className="book-detail-title">{book.title}</h1>
            {book.subtitle && <p className="book-detail-subtitle">{book.subtitle}</p>}
            <p className="book-detail-author">by <strong>{book.author}</strong></p>

            {book.description && (
              <div className="book-detail-desc">
                <h3>About this book</h3>
                <p>{book.description}</p>
              </div>
            )}

            {/* Meta grid */}
            <div className="book-detail-meta">
              {[
                { label: "ISBN",        value: book.isbn },
                { label: "Publisher",   value: book.publisher },
                { label: "Year",        value: book.publishedYear },
                { label: "Language",    value: book.language },
                { label: "Location",    value: book.shelfLocation },
                { label: "Total Copies", value: book.totalCopies },
              ].filter(m => m.value).map(m => (
                <div key={m.label} className="book-meta-item">
                  <span className="meta-label">{m.label}</span>
                  <span className="meta-value">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Inventory row */}
            <div className="book-inventory-row">
              <div className="inv-item avail-copies">
                <span className="inv-val">{book.availableCopies}</span>
                <span className="inv-label">Available</span>
              </div>
              <div className="inv-item">
                <span className="inv-val">{book.issuedCopies || 0}</span>
                <span className="inv-label">Issued</span>
              </div>
              <div className="inv-item">
                <span className="inv-val">{book.reservedCopies || 0}</span>
                <span className="inv-label">Reserved</span>
              </div>
              <div className="inv-item">
                <span className="inv-val">{book.borrowCount || 0}</span>
                <span className="inv-label">Total Borrows</span>
              </div>
            </div>

            {/* Actions */}
            <div className="book-detail-actions">
              {isStudent && (
                <Tooltip title={!available ? "No copies available" : ""}>
                  <button
                    className="reserve-btn"
                    onClick={handleReserve}
                    disabled={!available || reserving}
                  >
                    {reserving ? <span className="auth-spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff", width: 18, height: 18 }} />
                      : <><BookOutlined /> Reserve Book</>}
                  </button>
                </Tooltip>
              )}
              {!isAuthenticated && (
                <button className="reserve-btn" onClick={() => navigate("/login")}>
                  Sign in to Reserve
                </button>
              )}
              <Tooltip title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}>
                <button
                  className={`wishlist-btn ${inWishlist ? "active" : ""}`}
                  onClick={handleWishlist}
                >
                  {inWishlist ? <HeartFilled /> : <HeartOutlined />}
                </button>
              </Tooltip>
              {isStaff && (
                <>
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/dashboard/edit-book/${id}`)}
                    title="Edit book"
                  >
                    <EditOutlined /> Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={handleDelete}
                    title="Delete book"
                  >
                    <DeleteOutlined /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Similar Books */}
        {similar.length > 0 && (
          <div className="similar-section">
            <h2 className="similar-title">Similar Books</h2>
            <div className="similar-grid">
              {similar.map(b => <BookCard key={b._id} book={b} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
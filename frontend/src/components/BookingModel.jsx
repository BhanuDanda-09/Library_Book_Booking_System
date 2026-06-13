import { useState } from "react";
import { useLibrary } from "../context/LibraryContext";
import "./BookingModal.css";

export default function BookingModal({ book, onClose, navigate }) {
  const { bookABook } = useLibrary();
  const [name, setName] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name.");
    if (!returnDate) return setError("Please select a return date.");
    setError("");
    const success = bookABook(book.id, name.trim(), returnDate);
    if (success) {
      onClose();
      navigate("bookings");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <img
            src={book.cover}
            alt={book.title}
            className="modal-book-img"
            onError={(e) => {
              e.target.src = `https://placehold.co/80x110/2d3a4a/e8d5b7?text=Book`;
            }}
          />
          <div>
            <h2 className="modal-title">{book.title}</h2>
            <p className="modal-author">by {book.author}</p>
            <p className="modal-copies">
              {book.availableCopies} cop{book.availableCopies === 1 ? "y" : "ies"} available
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="borrower-name">Your Name</label>
            <input
              id="borrower-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="return-date">Return By</label>
            <input
              id="return-date"
              type="date"
              min={today}
              max={maxDateStr}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
            <span className="form-hint">Max 30 days borrowing period</span>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-book-confirm">
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
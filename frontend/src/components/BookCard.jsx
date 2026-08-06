import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import BookCover from "./BookCover";
import "./BookCard.css";

export default function BookCard({ book }) {
  const navigate    = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();
  const { wishlist, toggleWishlist }   = useLibrary();

  const inWishlist = wishlist?.some(w => (w._id || w) === book._id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate("/login"); return; }
    toggleWishlist(book._id);
  };

  return (
    <div className="book-card" onClick={() => navigate(`/book/${book._id}`)}>
      {/* Cover Image */}
      <div className="book-card-cover">
        <BookCover
          book={book}
          imgClassName="book-card-img"
          className="book-card-cover-fill"
        />

        {/* Hover overlay */}
        <div className="book-card-overlay">
          <button className="book-card-view-btn">View Details</button>
        </div>

        {/* Availability badge */}
        <div className={`book-card-avail ${book.availableCopies > 0 ? "available" : "unavailable"}`}>
          {book.availableCopies > 0 ? `${book.availableCopies} available` : "Unavailable"}
        </div>

        {/* Wishlist button */}
        {isStudent && (
          <button
            className={`book-card-heart ${inWishlist ? "active" : ""}`}
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {inWishlist ? <HeartFilled /> : <HeartOutlined />}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="book-card-body">
        <span className="book-card-category">{book.category}</span>
        <h3 className="book-card-title" title={book.title}>{book.title}</h3>
        <p className="book-card-author">by {book.author}</p>
      </div>
    </div>
  );
}
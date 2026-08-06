import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "../components/BookCard";
import EmptyState from "../components/ui/EmptyState";
import "./Wishlist.css";

export default function Wishlist() {
  const { wishlist, fetchWishlist } = useLibrary();
  const navigate = useNavigate();

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  return (
    <div className="wishlist-page page-wrapper animate-fadeInUp">
      <div className="wishlist-header">
        <div>
          <h1 className="wishlist-title">❤️ My Wishlist</h1>
          <p className="wishlist-sub">{wishlist.length} book{wishlist.length !== 1 ? "s" : ""} saved</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="Your wishlist is empty"
          description="Browse the catalog and tap the heart icon to save books you want to read."
          action={() => navigate("/catalog")}
          actionLabel="Browse Catalog"
        />
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

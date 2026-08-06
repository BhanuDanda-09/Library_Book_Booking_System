import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">📚 SmartLibrary</Link>
            <p className="footer-tagline">
              Your modern library management system. Discover, reserve, and manage books with ease.
            </p>
          </div>
          {/* Links */}
          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Library</h4>
              <Link to="/catalog">Browse Catalog</Link>
              <Link to="/catalog?available=true">Available Books</Link>
              <Link to="/register">Join Library</Link>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
              <Link to="/profile">My Profile</Link>
              <Link to="/my-bookings">My Bookings</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {year} SmartLibrary. Built with ❤️ for learners everywhere.</p>
          <div className="footer-badges">
            <span className="footer-badge">📚 88+ Books</span>
            <span className="footer-badge">👤 25+ Members</span>
            <span className="footer-badge">🏷️ 15 Categories</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Layout } from "antd";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="library-footer">
      <div className="footer-content">
        <div className="footer-section brand-info">
          <h3 className="footer-brand">📚 Aetherius Library</h3>
          <p className="footer-desc">
            A modern, digital solution for reserving, borrowing, and exploring our rich book catalog. Join us in cultivating knowledge and sharing stories.
          </p>
        </div>
        <div className="footer-section footer-links">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/catalog">Book Catalog</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Create Account</Link></li>
          </ul>
        </div>
        <div className="footer-section footer-hours">
          <h4>Desk Hours</h4>
          <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
          <p>Saturday: 9:00 AM - 5:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Aetherius Library. All rights reserved.</p>
        <p className="footer-subtext">Built with React, Ant Design & MERN Stack</p>
      </div>
    </footer>
  );
}

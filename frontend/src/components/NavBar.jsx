import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { useTheme } from "../context/ThemeContext";
import { Avatar, Dropdown, Badge } from "antd";
import {
  UserOutlined, LogoutOutlined, BookOutlined, DashboardOutlined,
  SunOutlined, MoonOutlined, BellOutlined, MenuOutlined, CloseOutlined,
  HeartOutlined, SettingOutlined
} from "@ant-design/icons";
import "./NavBar.css";

export default function NavBar() {
  const { user, isAuthenticated, logout, isStaff } = useAuth();
  const { bookings, unreadCount, fetchNotifications } = useLibrary();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  const activeBookingsCount = bookings?.filter(b =>
    ["pending", "approved", "issued"].includes(b.status)
  ).length || 0;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "header",
      label: (
        <div className="nav-menu-header">
          <div className="nav-menu-avatar">
            {user?.profilePicture
              ? <img src={user.profilePicture} alt={user?.name} />
              : <UserOutlined />
            }
          </div>
          <div>
            <p className="nav-menu-name">{user?.name}</p>
            <p className="nav-menu-role">{user?.role === "librarian" ? "Librarian" : user?.role === "admin" ? "Admin" : "Student"}</p>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { key: "profile",  label: <Link to="/profile">My Profile</Link>,          icon: <UserOutlined /> },
    user?.role === "student" && { key: "student-dash", label: <Link to="/student-dashboard">My Dashboard</Link>, icon: <DashboardOutlined /> },
    user?.role === "student" && { key: "wishlist",  label: <Link to="/wishlist">Wishlist</Link>,   icon: <HeartOutlined /> },
    user?.role === "student" && { key: "bookings",  label: <Link to="/my-bookings">My Bookings</Link>, icon: <BookOutlined /> },
    (isStaff) && { key: "dashboard", label: <Link to="/dashboard">Dashboard</Link>, icon: <DashboardOutlined /> },
    { type: "divider" },
    { key: "logout", label: <span onClick={handleLogout}>Sign Out</span>, icon: <LogoutOutlined />, danger: true },
  ].filter(Boolean);

  const navLinks = [
    { to: "/",       label: "Home" },
    { to: "/catalog", label: "Catalog" },
  ];

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={() => setMobileOpen(false)}>
          <span className="brand-icon">📚</span>
          <span className="brand-name">Smart<span className="brand-accent">Library</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >{l.label}</NavLink>
          ))}
          {isAuthenticated && user?.role === "student" && (
            <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              My Bookings
              {activeBookingsCount > 0 && (
                <span className="nav-badge">{activeBookingsCount}</span>
              )}
            </NavLink>
          )}
          {isAuthenticated && user?.role === "student" && (
            <NavLink to="/student-dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              My Dashboard
            </NavLink>
          )}
          {isAuthenticated && isStaff && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          {/* Theme toggle */}
          <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <SunOutlined style={{ color: "#f59e0b" }} /> : <MoonOutlined style={{ color: "#6366f1" }} />}
          </button>

          {/* Notifications bell */}
          {isAuthenticated && (
            <button className="nav-icon-btn" onClick={() => navigate("/notifications")} aria-label="Notifications">
              <Badge count={unreadCount} size="small" style={{ backgroundColor: "#ef4444" }}>
                <BellOutlined />
              </Badge>
            </button>
          )}

          {/* User dropdown or auth buttons */}
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow trigger={["click"]}>
              <div className="nav-user-trigger">
                <Avatar
                  size={36}
                  src={user?.profilePicture || undefined}
                  icon={!user?.profilePicture ? <UserOutlined /> : undefined}
                  style={{ backgroundColor: "#6366f1", cursor: "pointer" }}
                />
                <span className="nav-user-name">{user?.name?.split(" ")[0]}</span>
              </div>
            </Dropdown>
          ) : (
            <div className="nav-auth-btns">
              <button className="btn-nav-login" onClick={() => navigate("/login")}>Sign In</button>
              <button className="btn-nav-register" onClick={() => navigate("/register")}>Join Free</button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="nav-mobile-menu">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}
              className={({ isActive }) => `nav-mobile-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >{l.label}</NavLink>
          ))}
          {isAuthenticated && user?.role === "student" && (
            <NavLink to="/my-bookings" className={({ isActive }) => `nav-mobile-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}>
              My Bookings {activeBookingsCount > 0 && `(${activeBookingsCount})`}
            </NavLink>
          )}
          {isAuthenticated && user?.role === "student" && (
            <NavLink to="/student-dashboard" className={({ isActive }) => `nav-mobile-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}>
              My Dashboard
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/notifications" className={({ isActive }) => `nav-mobile-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </NavLink>
          )}
          {isAuthenticated && isStaff && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-mobile-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/profile" className={({ isActive }) => `nav-mobile-link ${isActive ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}>Profile</NavLink>
          )}
          <div className="nav-mobile-bottom">
            <button className="nav-mobile-theme" onClick={toggleTheme}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            {isAuthenticated
              ? <button className="nav-mobile-logout" onClick={handleLogout}>Sign Out</button>
              : <button className="nav-mobile-login" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Sign In</button>
            }
          </div>
        </div>
      )}
    </header>
  );
}
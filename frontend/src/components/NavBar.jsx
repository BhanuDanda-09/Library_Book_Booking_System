import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { Avatar, Dropdown, Button, Space, Badge } from "antd";
import { UserOutlined, LogoutOutlined, BookOutlined, DashboardOutlined, LoginOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext";
import "./NavBar.css";

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { bookings } = useLibrary();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Find count of active bookings for students (e.g. pending, approved, issued)
  const activeBookingsCount = bookings ? bookings.filter(
    (b) => ["pending", "approved", "issued"].includes(b.status)
  ).length : 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile-header",
      label: (
        <div className="user-profile-menu-header">
          <p className="user-menu-name">{user?.name}</p>
          <p className="user-menu-role">{user?.role === "librarian" ? "Librarian" : "Student"}</p>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "profile",
      label: <Link to="/profile">My Profile</Link>,
      icon: <UserOutlined />,
    },
    user?.role === "student" && {
      key: "student-dash",
      label: <Link to="/student-dashboard">Dashboard</Link>,
      icon: <DashboardOutlined />,
    },
    user?.role === "student" && {
      key: "my-bookings",
      label: <Link to="/my-bookings">My Bookings</Link>,
      icon: <BookOutlined />,
    },
    user?.role === "librarian" && {
      key: "dashboard",
      label: <Link to="/dashboard">Dashboard</Link>,
      icon: <DashboardOutlined />,
    },
    {
      key: "logout",
      label: <span onClick={handleLogout}>Log Out</span>,
      icon: <LogoutOutlined />,
      danger: true,
    },
  ].filter(Boolean);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-name">Smart</span>
          <span className="brand-sub">Library</span>
        </Link>

        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Home
          </NavLink>
          <NavLink to="/catalog" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Catalog
          </NavLink>
          {isAuthenticated && user?.role === "student" && (
            <NavLink to="/my-bookings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <Space size={4}>
                My Bookings
                {activeBookingsCount > 0 && (
                  <Badge count={activeBookingsCount} size="small" style={{ backgroundColor: "#6366f1" }} />
                )}
              </Space>
            </NavLink>
          )}
          {isAuthenticated && user?.role === "librarian" && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          <Button
            type="text"
            icon={isDark ? <SunOutlined style={{ color: "#f59e0b" }} /> : <MoonOutlined style={{ color: "#475569" }} />}
            onClick={toggleTheme}
            style={{ marginRight: 16, fontSize: "16px" }}
            className="theme-toggle-btn"
          />
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="user-profile-trigger">
                <span className="user-welcome-text">Hi, {user?.name.split(" ")[0]}</span>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: "#6366f1", verticalAlign: "middle", cursor: "pointer" }} 
                />
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Button type="text" onClick={() => navigate("/login")} className="btn-nav-login">
                Log In
              </Button>
              <Button type="primary" onClick={() => navigate("/register")} className="btn-nav-register">
                Register
              </Button>
            </Space>
          )}
        </div>
      </div>
    </header>
  );
}
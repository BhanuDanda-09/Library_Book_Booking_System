import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import BookCard from "../components/BookCard";
import { Button, Row, Col, Statistic, Card, Spin, Space, Timeline, Typography } from "antd";
import { BookOutlined, CheckCircleOutlined, CalendarOutlined, SearchOutlined, BookFilled, CheckOutlined } from "@ant-design/icons";
import "./Home.css";

const { Text } = Typography;

export default function Home() {
  const { books, isLoadingBooks, fetchBooks } = useLibrary();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks({ limit: 8 }); // Load the latest books
  }, [fetchBooks]);

  const totalAvailable = books.reduce((sum, b) => sum + b.availableCopies, 0);
  // Get new additions (latest 4 books)
  const newArrivals = books.slice(0, 4);

  const handleMyBookingsClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user.role === "librarian") {
      navigate("/dashboard");
    } else {
      navigate("/my-bookings");
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-eyebrow">Your neighborhood library, online</p>
          <h1 className="hero-headline">
            Find your next <em>great read</em>
          </h1>
          <p className="hero-sub">
            Browse our collection, request instant reservations, and pick up at the front desk. Simple, fast, and completely free.
          </p>
          <div className="hero-actions">
            <Button
              type="primary"
              size="large"
              className="hero-btn-primary"
              onClick={() => navigate("/catalog")}
            >
              Browse Catalog
            </Button>
            <Button
              size="large"
              className="hero-btn-secondary"
              onClick={handleMyBookingsClick}
            >
              My Bookings
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="stats-section">
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={8}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Catalog Size"
                value={books.length}
                prefix={<BookOutlined style={{ color: "#6366f1", marginRight: 8 }} />}
                valueStyle={{ fontWeight: 800, color: "#1f2937" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Available Copies"
                value={totalAvailable}
                prefix={<CheckCircleOutlined style={{ color: "#10b981", marginRight: 8 }} />}
                valueStyle={{ fontWeight: 800, color: "#1f2937" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card" bordered={false}>
              <Statistic
                title="Borrow Period"
                value={14}
                suffix="Days"
                prefix={<CalendarOutlined style={{ color: "#f59e0b", marginRight: 8 }} />}
                valueStyle={{ fontWeight: 800, color: "#1f2937" }}
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* New Arrivals Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">New Arrivals</h2>
          <Button type="link" size="large" onClick={() => navigate("/catalog")} className="view-all-link">
            View all books →
          </Button>
        </div>

        {isLoadingBooks ? (
          <div className="home-spinner">
            <Spin size="large" tip="Loading new books..." />
          </div>
        ) : newArrivals.length === 0 ? (
          <Card className="empty-arrival-card">
            <Text type="secondary">No books currently in catalog. Check back soon!</Text>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {newArrivals.map((book) => (
              <Col xs={24} sm={12} md={6} key={book._id}>
                <BookCard book={book} />
              </Col>
            ))}
          </Row>
        )}
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title text-center">How It Works</h2>
        <div className="timeline-container">
          <Timeline mode="alternate">
            <Timeline.Item dot={<SearchOutlined style={{ fontSize: "20px", color: "#6366f1" }} />}>
              <div className="timeline-block">
                <h3>1. Search & Discover</h3>
                <p>Browse through categories or search by title/author in our online catalog to find books you want to read.</p>
              </div>
            </Timeline.Item>
            <Timeline.Item dot={<BookFilled style={{ fontSize: "20px", color: "#10b981" }} />}>
              <div className="timeline-block">
                <h3>2. Request Reservation</h3>
                <p>Select your book and submit a booking request. Librarians will approve and prepare the copy for you.</p>
              </div>
            </Timeline.Item>
            <Timeline.Item dot={<CheckOutlined style={{ fontSize: "20px", color: "#f59e0b" }} />}>
              <div className="timeline-block">
                <h3>3. Pick Up & Enjoy</h3>
                <p>Pick up the issued book at the desk. Keep it for up to 14 days, and return it when you are finished.</p>
              </div>
            </Timeline.Item>
          </Timeline>
        </div>
      </section>
    </div>
  );
}
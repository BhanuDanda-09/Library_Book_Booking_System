import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { demoBooks } from "../services/demoData";
import API from "../services/api";
import { Row, Col, Tag, Button, Table, Typography, Space, Card, Spin, Alert, Modal, Descriptions } from "antd";
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, GlobalOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import "./BookDetail.css";

const { Title, Text, Paragraph } = Typography;

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createReservation } = useLibrary();
  const { isAuthenticated, user } = useAuth();

  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isReserving, setIsReserving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch book details on mount
  useEffect(() => {
    const fetchBookDetail = async () => {
      if (id && id.startsWith("demo-")) {
        const found = demoBooks.find((b) => b._id === id);
        if (found) {
          setBook(found);
          setErrorMsg("");
          setIsLoading(false);
          return;
        }
      }

      try {
        setIsLoading(true);
        const res = await API.get(`/books/${id}`);
        if (res.data.success) {
          setBook(res.data.book);
        } else {
          setErrorMsg("Book not found.");
        }
      } catch (err) {
        console.error("Fetch book detail error:", err);
        const found = demoBooks.find((b) => b._id === id);
        if (found) {
          setBook(found);
          setErrorMsg("");
        } else {
          setErrorMsg(err.response?.data?.message || "Failed to load book details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetail();
  }, [id]);

  const handleReserveClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmReservation = async () => {
    setIsReserving(true);
    const result = await createReservation(book._id);
    setIsReserving(false);
    setShowConfirmModal(false);
    if (result.success) {
      navigate("/my-bookings");
    }
  };

  if (isLoading) {
    return (
      <div className="detail-loading-wrapper">
        <Spin size="large" tip="Loading book details..." />
      </div>
    );
  }

  if (errorMsg || !book) {
    return (
      <div className="detail-error-wrapper">
        <Alert
          message="Error Loading Book"
          description={errorMsg || "The book you requested does not exist."}
          type="error"
          showIcon
          action={
            <Link to="/catalog">
              <Button size="small" type="primary">Back to Catalog</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const isStudent = user?.role === "student";

  // Resolve cover image path
  const getCoverUrl = (path) => {
    if (!path) return `https://placehold.co/300x420/6366f1/ffffff?text=${encodeURIComponent(book.title)}`;
    if (path.startsWith("/uploads")) {
      return `http://localhost:5000${path}`;
    }
    return path;
  };

  return (
    <div className="book-detail-container">
      {/* Back Button */}
      <Link to="/catalog" className="back-link">
        <ArrowLeftOutlined /> Back to Catalog
      </Link>

      <Row gutter={[40, 40]} className="detail-layout-row">
        {/* Cover Column */}
        <Col xs={24} md={8} className="detail-cover-col">
          <Card
            bordered={false}
            className="detail-cover-card"
            cover={
              <img
                alt={book.title}
                src={getCoverUrl(book.coverImage)}
                className="detail-cover-img"
                onError={(e) => {
                  e.target.src = `https://placehold.co/300x420/6366f1/ffffff?text=${encodeURIComponent(book.title)}`;
                }}
              />
            }
          >
            <div className={`detail-status-banner ${isAvailable ? "status-in-stock" : "status-out-of-stock"}`}>
              {isAvailable ? (
                <span>
                  <CheckCircleOutlined /> {book.availableCopies} of {book.totalCopies} copies available
                </span>
              ) : (
                <span>
                  <ExclamationCircleOutlined /> Out of stock
                </span>
              )}
            </div>

            {/* Reserve Button */}
            {!isAuthenticated || isStudent ? (
              <Button
                type="primary"
                size="large"
                block
                disabled={!isAvailable}
                className="btn-reserve-book"
                onClick={handleReserveClick}
              >
                {!isAvailable ? "Unavailable" : "Reserve This Copy"}
              </Button>
            ) : (
              <Alert
                message="Librarians cannot request reservations. Switch to a student account to book."
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>

        {/* Info Column */}
        <Col xs={24} md={16} className="detail-info-col">
          <Tag color="indigo" className="detail-category-tag">
            {book.category}
          </Tag>
          
          <Title level={1} className="detail-book-title">{book.title}</Title>
          <Text type="secondary" className="detail-book-author">
            <UserOutlined /> by {book.author}
          </Text>

          {/* Quick Info Grid */}
          <div className="quick-info-grid">
            <Card className="qinfo-card" bordered={false}>
              <Text type="secondary" size="small">ISBN</Text>
              <Text strong className="qinfo-value">{book.isbn}</Text>
            </Card>
            <Card className="qinfo-card" bordered={false}>
              <Text type="secondary" size="small">Language</Text>
              <Text strong className="qinfo-value">{book.language}</Text>
            </Card>
            <Card className="qinfo-card" bordered={false}>
              <Text type="secondary" size="small">Published</Text>
              <Text strong className="qinfo-value">{book.publishedYear || "N/A"}</Text>
            </Card>
          </div>

          {/* Book Description */}
          {book.description && (
            <div className="detail-section">
              <Title level={4}>About This Book</Title>
              <Paragraph className="detail-paragraph">{book.description}</Paragraph>
            </div>
          )}

          {/* Technical Details */}
          <div className="detail-section">
            <Title level={4}>Bibliographic Details</Title>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" className="detail-desc-table">
              <Descriptions.Item label="Title">{book.title}</Descriptions.Item>
              <Descriptions.Item label="Author">{book.author}</Descriptions.Item>
              <Descriptions.Item label="Category">{book.category}</Descriptions.Item>
              <Descriptions.Item label="ISBN">{book.isbn}</Descriptions.Item>
              <Descriptions.Item label="Publisher">{book.publisher || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Published Year">{book.publishedYear || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Language">{book.language}</Descriptions.Item>
              <Descriptions.Item label="Total Copies">{book.totalCopies}</Descriptions.Item>
            </Descriptions>
          </div>
        </Col>
      </Row>

      {/* Reservation Confirmation Modal */}
      <Modal
        title="Confirm Book Reservation"
        open={showConfirmModal}
        onOk={confirmReservation}
        onCancel={() => setShowConfirmModal(false)}
        confirmLoading={isReserving}
        okText="Confirm Reservation"
        cancelText="Cancel"
      >
        <Space direction="vertical" size="middle" style={{ width: "100%", padding: "10px 0" }}>
          <Text>
            Are you sure you want to request a copy of <strong>{book.title}</strong> by {book.author}?
          </Text>
          <Alert
            message="Your booking will start as pending. You will need to pick up the book from the front desk once approved by a librarian."
            type="info"
            showIcon
          />
        </Space>
      </Modal>
    </div>
  );
}
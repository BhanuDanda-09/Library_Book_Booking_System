import { Link } from "react-router-dom";
import { Card, Tag, Badge, Typography, Space } from "antd";
import { BookOutlined, UserOutlined } from "@ant-design/icons";
import "./BookCard.css";

const { Title, Text } = Typography;

export default function BookCard({ book }) {
  const isAvailable = book.availableCopies > 0;

  // Resolve cover image path. If it starts with /uploads, prepend the backend host
  const getCoverUrl = (path) => {
    if (!path) return `https://placehold.co/240x320/6366f1/ffffff?text=${encodeURIComponent(book.title)}`;
    if (path.startsWith("/uploads")) {
      return `http://localhost:5000${path}`;
    }
    return path;
  };

  return (
    <Link to={`/book/${book._id}`} className="book-card-link">
      <Card
        hoverable
        className="custom-book-card"
        cover={
          <div className="book-card-cover-wrapper">
            <img
              alt={book.title}
              src={getCoverUrl(book.coverImage)}
              className="book-card-cover"
              loading="lazy"
              onError={(e) => {
                e.target.src = `https://placehold.co/240x320/6366f1/ffffff?text=${encodeURIComponent(book.title)}`;
              }}
            />
            <span className="book-card-badge">
              <Badge
                status={isAvailable ? "success" : "error"}
                text={isAvailable ? `${book.availableCopies} available` : "Out of stock"}
                style={{
                  background: isAvailable ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              />
            </span>
          </div>
        }
      >
        <div className="book-card-content">
          <Tag color="geekblue" className="book-card-category-tag">
            {book.category}
          </Tag>
          
          <Title level={5} ellipsis={{ rows: 2 }} className="book-card-title">
            {book.title}
          </Title>
          
          <Space direction="vertical" size={2} style={{ width: "100%" }}>
            <Text type="secondary" ellipsis className="book-card-author">
              <UserOutlined style={{ marginRight: 4 }} />
              {book.author}
            </Text>
            {book.publishedYear && (
              <Text type="secondary" size="small" className="book-card-meta">
                <BookOutlined style={{ marginRight: 4 }} />
                Published: {book.publishedYear}
              </Text>
            )}
          </Space>
        </div>
      </Card>
    </Link>
  );
}
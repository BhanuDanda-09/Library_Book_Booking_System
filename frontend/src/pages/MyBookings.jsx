import { useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import { Link, useNavigate } from "react-router-dom";
import { demoBookings } from "../services/demoData";
import { Table, Tag, Typography, Alert, Card, Spin, Space, Button, List, Row, Col } from "antd";
import { BookOutlined, ClockCircleOutlined, CalendarOutlined, CheckCircleOutlined, InfoCircleOutlined, CheckSquareOutlined, WarningOutlined } from "@ant-design/icons";
import "./MyBookings.css";

const { Title, Text } = Typography;

export default function MyBookings() {
  const { bookings, isLoadingBookings, fetchMyReservations } = useLibrary();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

  // Determine active booking list (DB vs fallback demo)
  const activeBookings = bookings && bookings.length > 0 ? bookings : demoBookings;
  const isDemo = !(bookings && bookings.length > 0);

  // Status badge styling mapper
  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: "warning", label: "Pending Approval" },
      approved: { color: "processing", label: "Approved (Ready for Pickup)" },
      issued: { color: "success", label: "Issued (Borrowed)" },
      returned: { color: "default", label: "Returned" },
      cancelled: { color: "error", label: "Cancelled" },
      overdue: { color: "volcano", label: "Overdue" },
    };

    const config = statusMap[status] || { color: "default", label: status };
    return <Tag color={config.color}>{config.label.toUpperCase()}</Tag>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      title: "Book Title",
      dataIndex: "book",
      key: "title",
      render: (book) => (
        <Space direction="vertical" size={1}>
          {book ? (
            <Link to={`/book/${book._id}`} className="booking-book-link">
              <strong>{book.title}</strong>
            </Link>
          ) : (
            <Text type="danger">Book Removed</Text>
          )}
          {book && <Text type="secondary" style={{ fontSize: "12px" }}>by {book.author}</Text>}
        </Space>
      ),
    },
    {
      title: "Category",
      dataIndex: "book",
      key: "category",
      render: (book) => book?.category || "-",
    },
    {
      title: "Reserved On",
      dataIndex: "reservationDate",
      key: "reservationDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date, record) => {
        if (!date) return "-";
        const isOverdue = record.status === "issued" && new Date(date) < new Date();
        return (
          <Text type={isOverdue ? "danger" : "secondary"} strong={isOverdue}>
            {formatDate(date)} {isOverdue && "(Overdue)"}
          </Text>
        );
      },
    },
    {
      title: "Fine Status",
      dataIndex: "fine",
      key: "fine",
      render: (fine) => {
        if (!fine || fine.amount === 0) return "-";
        return (
          <Space>
            <Text type="danger" strong>${fine.amount.toFixed(2)}</Text>
            {fine.paid ? <Tag color="green">PAID</Tag> : <Tag color="red">UNPAID</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const isOverdue = record.status === "issued" && record.dueDate && new Date(record.dueDate) < new Date();
        return isOverdue ? <Tag color="volcano">OVERDUE</Tag> : getStatusTag(status);
      },
    },
  ];

  const guidelines = [
    "Approved reservations must be collected from the library front desk.",
    "Bring your student/library ID while collecting books.",
    "Reserved books must be collected within 3 days of approval.",
    "Books should be returned on or before the due date.",
    "Overdue books incur a fee of $5 per day.",
    "Lost or damaged books must be reported immediately.",
    "Contact the librarian for renewal requests."
  ];

  return (
    <div className="my-bookings-container">
      {/* Page Header */}
      <div className="bookings-page-header">
        <div>
          <Title level={2} className="bookings-title">My Reservations</Title>
          <Text type="secondary">
            Track your book borrowing history, check due dates, and monitor overdue fines. {isDemo && "(Rendering demo fallbacks)"}
          </Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Bookings Table Column */}
        <Col xs={24} lg={16}>
          {isLoadingBookings ? (
            <div className="bookings-loading-wrapper">
              <Spin size="large" description="Loading reservations..." />
            </div>
          ) : activeBookings.length === 0 ? (
            <Card className="empty-bookings-card" variant="borderless">
              <Space direction="vertical" size="large" align="center">
                <div className="empty-icon-wrap">📂</div>
                <div>
                  <Title level={4}>No reservations found</Title>
                  <Text type="secondary">You haven't requested any book bookings yet.</Text>
                </div>
                <Button type="primary" size="large" onClick={() => navigate("/catalog")}>
                  Browse Catalog
                </Button>
              </Space>
            </Card>
          ) : (
            <Card className="table-card" variant="borderless">
              <Table
                dataSource={activeBookings}
                columns={columns}
                rowKey="_id"
                pagination={{ pageSize: 8 }}
                className="bookings-table"
              />
            </Card>
          )}
        </Col>

        {/* Guidelines checklist sidebar */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <InfoCircleOutlined style={{ color: "#6366f1" }} />
                <span>Library Reservation & Return Guidelines</span>
              </Space>
            }
            variant="borderless"
            className="bookings-guidelines-sidebar"
          >
            <List
              dataSource={guidelines}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: "none", padding: "6px 0", alignItems: "flex-start" }}>
                  <Space align="start">
                    <CheckSquareOutlined style={{ color: "#10b981", marginTop: "3px" }} />
                    <Text style={{ fontSize: "13px" }}>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
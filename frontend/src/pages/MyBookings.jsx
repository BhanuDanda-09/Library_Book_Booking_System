import { useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import { Link } from "react-router-dom";
import { Table, Tag, Typography, Alert, Card, Spin, Space, Button, Badge } from "antd";
import { BookOutlined, ClockCircleOutlined, CalendarOutlined, CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import "./MyBookings.css";

const { Title, Text } = Typography;

export default function MyBookings() {
  const { bookings, isLoadingBookings, fetchMyReservations } = useLibrary();

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

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

  // Ant Design Table Columns definition
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
          {book && <Text type="secondary" size="small">by {book.author}</Text>}
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
      render: (fine, record) => {
        if (!fine || fine.amount === 0) return "-";
        return (
          <Space>
            <Text type="danger" strong>${fine.amount}</Text>
            {fine.paid ? <Tag color="green">PAID</Tag> : <Tag color="red">UNPAID</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
  ];

  if (isLoadingBookings) {
    return (
      <div className="bookings-loading-wrapper">
        <Spin size="large" tip="Loading your reservations..." />
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      {/* Page Header */}
      <div className="bookings-page-header">
        <div>
          <Title level={2} className="bookings-title">My Bookings</Title>
          <Text type="secondary">Track your book lending history and due dates</Text>
        </div>
      </div>

      {/* Info notice */}
      <Alert
        message="Reservation Pick-up and Returns Guide"
        description="Pending and approved book reservations must be claimed physically at the library front desk. Returns are processed by librarians, who will assess overdue fees if books are returned past their due dates ($5 per day)."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      {bookings.length === 0 ? (
        <Card className="empty-bookings-card" bordered={false}>
          <Space direction="vertical" size="large" align="center">
            <div className="empty-icon-wrap">📂</div>
            <div>
              <Title level={4}>No bookings found</Title>
              <Text type="secondary">You haven't requested any book reservations yet.</Text>
            </div>
            <Link to="/catalog">
              <Button type="primary" size="large">Browse Catalog</Button>
            </Link>
          </Space>
        </Card>
      ) : (
        <Card className="table-card" bordered={false}>
          <Table
            dataSource={bookings}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            className="bookings-table"
          />
        </Card>
      )}
    </div>
  );
}
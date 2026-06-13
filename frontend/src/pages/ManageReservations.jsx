import { useState, useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import { Link } from "react-router-dom";
import { Card, Table, Tag, Button, Radio, Space, Typography, Spin, Alert } from "antd";
import { ArrowLeftOutlined, ReadOutlined, CalendarOutlined, CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import "./ManageReservations.css";

const { Title, Text } = Typography;

export default function ManageReservations() {
  const { bookings, isLoadingBookings, fetchAllReservations, updateReservationStatus } = useLibrary();
  const [resFilter, setResFilter] = useState("All");

  useEffect(() => {
    fetchAllReservations(resFilter);
  }, [resFilter, fetchAllReservations]);

  const handleStatusChange = async (id, status) => {
    const res = await updateReservationStatus(id, status);
    if (res.success) {
      fetchAllReservations(resFilter);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: "warning", label: "Pending" },
      approved: { color: "processing", label: "Approved" },
      issued: { color: "success", label: "Issued" },
      returned: { color: "default", label: "Returned" },
      cancelled: { color: "error", label: "Cancelled" },
      overdue: { color: "volcano", label: "Overdue" },
    };
    const config = statusMap[status] || { color: "default", label: status };
    return <Tag color={config.color}>{config.label.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: "Borrower Details",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <Space direction="vertical" size={1}>
          <strong>{user?.name || "Unknown User"}</strong>
          <Text type="secondary" style={{ fontSize: "12px" }}>{user?.email}</Text>
        </Space>
      )
    },
    {
      title: "Book Title",
      dataIndex: "book",
      key: "book",
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
      )
    },
    {
      title: "Dates Timeline",
      key: "dates",
      render: (_, record) => (
        <Space direction="vertical" size={1} style={{ fontSize: "12px" }}>
          <span><Text type="secondary">Reserved:</Text> {formatDate(record.reservationDate)}</span>
          {record.issueDate && <span><Text type="secondary">Issued:</Text> {formatDate(record.issueDate)}</span>}
          {record.dueDate && (
            <span>
              <Text type={record.status === "issued" && new Date(record.dueDate) < new Date() ? "danger" : "secondary"}>Due:</Text>{" "}
              {formatDate(record.dueDate)}
            </span>
          )}
          {record.returnDate && <span><Text type="secondary">Returned:</Text> {formatDate(record.returnDate)}</span>}
        </Space>
      )
    },
    {
      title: "Fines & Status",
      key: "fines_status",
      render: (_, record) => (
        <Space direction="vertical" size={1}>
          {getStatusTag(record.status)}
          {record.fine && record.fine.amount > 0 && (
            <Tag color="red" style={{ fontWeight: 600 }}>
              Fine: ${record.fine.amount} ({record.fine.paid ? "Paid" : "Unpaid"})
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status === "pending" && (
            <>
              <Button type="primary" size="small" onClick={() => handleStatusChange(record._id, "approved")}>
                Approve
              </Button>
              <Button danger size="small" onClick={() => handleStatusChange(record._id, "cancelled")}>
                Reject
              </Button>
            </>
          )}
          {record.status === "approved" && (
            <Button type="primary" size="small" style={{ backgroundColor: "#10b981", borderColor: "#10b981" }} onClick={() => handleStatusChange(record._id, "issued")}>
              Issue Book
            </Button>
          )}
          {record.status === "issued" && (
            <Button type="primary" size="small" style={{ backgroundColor: "#f59e0b", borderColor: "#f59e0b" }} onClick={() => handleStatusChange(record._id, "returned")}>
              Mark Returned
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="manage-reservations-container">
      {/* Back Link */}
      <Link to="/dashboard" className="back-to-dash-link">
        <ArrowLeftOutlined /> Back to Dashboard
      </Link>

      <div className="manage-res-header">
        <Title level={2} className="manage-res-title">Manage Reservations</Title>
        <Text type="secondary">Approve pending book reservation requests and process borrowing pick-ups/returns</Text>
      </div>

      <Card className="manage-res-card" bordered={false}>
        {/* Status Filtering */}
        <div className="res-filters-bar">
          <Text strong style={{ marginRight: 12 }}>Filter By Status:</Text>
          <Radio.Group value={resFilter} onChange={(e) => setResFilter(e.target.value)} size="middle">
            <Radio.Button value="All">ALL</Radio.Button>
            <Radio.Button value="Pending">PENDING</Radio.Button>
            <Radio.Button value="Approved">APPROVED</Radio.Button>
            <Radio.Button value="Issued">ISSUED</Radio.Button>
            <Radio.Button value="Returned">RETURNED</Radio.Button>
            <Radio.Button value="Cancelled">CANCELLED</Radio.Button>
          </Radio.Group>
        </div>

        {isLoadingBookings ? (
          <div className="manage-res-loading">
            <Spin size="large" tip="Loading reservations..." />
          </div>
        ) : (
          <Table
            dataSource={bookings}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 15 }}
            className="manage-res-table"
          />
        )}
      </Card>
    </div>
  );
}

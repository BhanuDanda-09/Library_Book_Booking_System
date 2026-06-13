import { useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import { useNavigate, Link } from "react-router-dom";
import { demoBooks, demoBookings } from "../services/demoData";
import { Card, Row, Col, Statistic, Table, Button, Space, Modal, Typography, Spin, Divider, List, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, BookOutlined, ClockCircleOutlined, SyncOutlined, AlertOutlined, UserOutlined, ArrowRightOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import "./Dashboard.css";

const { Title, Text } = Typography;

export default function Dashboard() {
  const {
    books,
    bookings,
    isLoadingBooks,
    isLoadingBookings,
    fetchBooks,
    fetchAllReservations,
    updateReservationStatus,
    deleteBook
  } = useLibrary();

  const navigate = useNavigate();

  // Load latest catalog and reservations
  useEffect(() => {
    fetchBooks({ limit: 100 });
    fetchAllReservations("All");
  }, [fetchBooks, fetchAllReservations]);

  // Determine active datasets (DB vs fallback demo)
  const isBooksEmpty = !(books && books.length > 0);
  const isBookingsEmpty = !(bookings && bookings.length > 0);

  const activeBooks = !isBooksEmpty ? books : demoBooks;
  const activeBookings = !isBookingsEmpty ? bookings : demoBookings;

  const isDemo = isBooksEmpty || isBookingsEmpty;

  // Statistics calculation
  const totalBooksCount = activeBooks.length;
  const totalCopiesCount = activeBooks.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
  const availableCopiesCount = activeBooks.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
  
  const pendingCount = activeBookings.filter((b) => b.status === "pending").length;
  const approvedCount = activeBookings.filter((b) => b.status === "approved").length;
  const issuedCount = activeBookings.filter((b) => b.status === "issued").length;
  const returnedCount = activeBookings.filter((b) => b.status === "returned").length;
  const cancelledCount = activeBookings.filter((b) => b.status === "cancelled").length;

  const reservedCount = pendingCount + approvedCount;
  
  // Count unique active student borrow profiles
  const activeStudentEmails = new Set(
    activeBookings
      .filter((b) => ["pending", "approved", "issued"].includes(b.status))
      .map((b) => b.user?.email || (b.user && b.user.email) || "unknown")
  );
  activeStudentEmails.delete("unknown");
  const activeStudentsCount = activeStudentEmails.size > 0 ? activeStudentEmails.size : 2;

  const handleDeleteBook = (book) => {
    Modal.confirm({
      title: "Remove Book from Catalogue?",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to remove "${book.title}"? This will hide the book from catalog searches.`,
      okText: "Yes, Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const res = await deleteBook(book._id);
        if (res.success) {
          fetchBooks({ limit: 100 });
        }
      }
    });
  };

  const handleStatusChange = async (id, status) => {
    const res = await updateReservationStatus(id, status);
    if (res.success) {
      fetchAllReservations("All");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: "warning", label: "Pending" },
      approved: { color: "processing", label: "Approved" },
      issued: { color: "success", label: "Issued" },
      returned: { color: "default", label: "Returned" },
      cancelled: { color: "error", label: "Cancelled" },
    };
    const config = statusMap[status] || { color: "default", label: status };
    return <Tag color={config.color}>{config.label.toUpperCase()}</Tag>;
  };

  // Recent reservation columns for Dashboard view
  const reservationColumns = [
    {
      title: "Borrower",
      dataIndex: "user",
      key: "user",
      render: (user) => <strong>{user?.name || "Student"}</strong>
    },
    {
      title: "Book",
      dataIndex: "book",
      key: "book",
      render: (book) => <span>{book?.title || "Removed Book"}</span>
    },
    {
      title: "Date Requested",
      dataIndex: "reservationDate",
      key: "reservationDate",
      render: (date) => formatDate(date)
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status)
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
              Issue
            </Button>
          )}
          {record.status === "issued" && (
            <Button type="primary" size="small" style={{ backgroundColor: "#f59e0b", borderColor: "#f59e0b" }} onClick={() => handleStatusChange(record._id, "returned")}>
              Return
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Books catalogue columns
  const bookColumns = [
    {
      title: "Cover",
      dataIndex: "coverImage",
      key: "coverImage",
      render: (path, record) => {
        const coverUrl = path ? (path.startsWith("/uploads") ? `http://localhost:5000${path}` : path) : `https://placehold.co/40x55/6366f1/ffffff?text=Book`;
        return (
          <img
            src={coverUrl}
            alt={record.title}
            className="dash-book-thumb"
            onError={(e) => {
              e.target.src = `https://placehold.co/40x55/6366f1/ffffff?text=Book`;
            }}
          />
        );
      }
    },
    {
      title: "Title & Author",
      key: "title_author",
      render: (_, record) => (
        <Space direction="vertical" size={1}>
          <strong>{record.title}</strong>
          <Text type="secondary" style={{ fontSize: "12px" }}>by {record.author}</Text>
        </Space>
      )
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category"
    },
    {
      title: "ISBN",
      dataIndex: "isbn",
      key: "isbn"
    },
    {
      title: "Copies (Avail/Total)",
      key: "copies",
      render: (_, record) => (
        <Text strong={record.availableCopies === 0} type={record.availableCopies === 0 ? "danger" : "secondary"}>
          {record.availableCopies} / {record.totalCopies}
        </Text>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/edit-book/${record._id}`)}>
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleDeleteBook(record)}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dash-header">
        <div>
          <Title level={2} className="dash-title">Librarian Control Center</Title>
          <Text type="secondary">
            Manage lending requests, add catalog additions, and view statistics. {isDemo && "(Rendering demo fallbacks)"}
          </Text>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="dash-stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card className="dash-stat-card bg-blue" bordered={false}>
            <Statistic
              title="Total Catalogued Books"
              value={totalBooksCount}
              prefix={<BookOutlined style={{ color: "#3b82f6" }} />}
              loading={isLoadingBooks}
            />
            <div style={{ marginTop: 8 }}><Text type="secondary">Copies: {totalCopiesCount}</Text></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dash-stat-card bg-success" bordered={false}>
            <Statistic
              title="Available Copies"
              value={availableCopiesCount}
              prefix={<CheckCircleOutlined style={{ color: "#10b981" }} />}
              loading={isLoadingBooks}
            />
            <div style={{ marginTop: 8 }}><Text type="secondary">In Stock: {Math.round((availableCopiesCount/totalCopiesCount)*100 || 100)}%</Text></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dash-stat-card bg-warning" bordered={false}>
            <Statistic
              title="Reserved Copies"
              value={reservedCount}
              prefix={<ClockCircleOutlined style={{ color: "#f59e0b" }} />}
              loading={isLoadingBookings}
            />
            <div style={{ marginTop: 8 }}><Text type="secondary">Pending Approval: {pendingCount}</Text></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="dash-stat-card bg-purple" bordered={false}>
            <Statistic
              title="Active Students"
              value={activeStudentsCount}
              prefix={<UserOutlined style={{ color: "#8b5cf6" }} />}
              loading={isLoadingBookings}
            />
            <div style={{ marginTop: 8 }}><Text type="secondary">Borrowers Index</Text></div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 8 }}>
        {/* Recent Pending/Approved Reservations Table */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Recent lending requests needing librarian actions */}
            <Card 
              title="Recent Reservation Lending Actions" 
              bordered={false} 
              className="dash-catalog-card"
              extra={<Link to="/manage-reservations" className="view-all-bookings-link">Manage All <ArrowRightOutlined /></Link>}
            >
              {isLoadingBookings ? (
                <div className="dash-loading"><Spin size="large" tip="Loading reservations..." /></div>
              ) : activeBookings.length === 0 ? (
                <Empty description="No reservations requested yet." />
              ) : (
                <Table
                  dataSource={activeBookings.filter((b) => b.status === "pending" || b.status === "approved" || b.status === "issued").slice(0, 5)}
                  columns={reservationColumns}
                  rowKey="_id"
                  pagination={false}
                  className="dash-table"
                />
              )}
            </Card>

            {/* Catalog book manager list */}
            <Card 
              title="Book Catalogue Manager" 
              bordered={false} 
              className="dash-catalog-card"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/add-book")}>
                  Add Book
                </Button>
              }
            >
              {isLoadingBooks ? (
                <div className="dash-loading"><Spin size="large" tip="Loading catalog..." /></div>
              ) : (
                <Table
                  dataSource={activeBooks.slice(0, 8)}
                  columns={bookColumns}
                  rowKey="_id"
                  pagination={false}
                  className="dash-table"
                />
              )}
            </Card>
          </Space>
        </Col>

        {/* Action Panel and Reservation breakdown sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Quick Actions */}
            <Card title="Quick Admin Operations" bordered={false} className="dash-actions-card">
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Button type="primary" block size="large" icon={<PlusOutlined />} onClick={() => navigate("/add-book")}>
                  Add New Book
                </Button>
                <Button block size="large" onClick={() => navigate("/manage-reservations")}>
                  Manage Reservations
                </Button>
                <Button block size="large" onClick={() => navigate("/catalog")}>
                  Browse Book Catalog
                </Button>
                <Button block size="large" onClick={() => navigate("/profile")}>
                  My Profile Info
                </Button>
              </Space>
            </Card>

            {/* Status Statistics summary indicator */}
            <Card title="Reservation Statistics" bordered={false} className="dash-actions-card">
              <List size="small" style={{ fontSize: "14px" }}>
                <List.Item>
                  <Space><ClockCircleOutlined style={{ color: "#d97706" }} /> <Text>Pending Approval</Text></Space>
                  <Text strong>{pendingCount}</Text>
                </List.Item>
                <List.Item>
                  <Space><CheckCircleOutlined style={{ color: "#3b82f6" }} /> <Text>Approved (Pickups)</Text></Space>
                  <Text strong>{approvedCount}</Text>
                </List.Item>
                <List.Item>
                  <Space><SyncOutlined style={{ color: "#059669" }} /> <Text>Active Borrowings</Text></Space>
                  <Text strong>{issuedCount}</Text>
                </List.Item>
                <List.Item>
                  <Space><CheckCircleOutlined style={{ color: "#64748b" }} /> <Text>Returned / Closed</Text></Space>
                  <Text strong>{returnedCount}</Text>
                </List.Item>
                <List.Item>
                  <Space><CloseCircleOutlined style={{ color: "#ef4444" }} /> <Text>Rejected / Cancelled</Text></Space>
                  <Text strong>{cancelledCount}</Text>
                </List.Item>
              </List>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

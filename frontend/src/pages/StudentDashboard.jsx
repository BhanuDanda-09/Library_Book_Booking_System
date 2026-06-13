import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { demoBookings } from "../services/demoData";
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space, Alert, Empty, Timeline, List } from "antd";
import { BookOutlined, CalendarOutlined, DollarCircleOutlined, RightOutlined, UserOutlined, ClockCircleOutlined, WarningOutlined, InfoCircleOutlined, CheckSquareOutlined } from "@ant-design/icons";
import "./StudentDashboard.css";

const { Title, Text } = Typography;

export default function StudentDashboard() {
  const { user } = useAuth();
  const { bookings, isLoadingBookings, fetchMyReservations } = useLibrary();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

  // Determine active booking list (DB vs fallback demo)
  const activeBookings = bookings && bookings.length > 0 ? bookings : demoBookings;
  const isDemo = !(bookings && bookings.length > 0);

  // Calculations
  const reservedBooks = activeBookings.filter((b) => b.status === "pending" || b.status === "approved");
  const borrowedBooks = activeBookings.filter((b) => b.status === "issued");
  const overdueBooks = activeBookings.filter(
    (b) => b.status === "issued" && b.dueDate && new Date(b.dueDate) < new Date()
  );
  
  const unpaidFines = activeBookings.reduce((sum, b) => {
    if (b.fine && !b.fine.paid) {
      return sum + b.fine.amount;
    }
    return sum;
  }, 0);

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

  const columns = [
    {
      title: "Book",
      dataIndex: "book",
      key: "book",
      render: (book) => (
        <Space direction="vertical" size={1}>
          {book ? (
            <Link to={`/book/${book._id}`} className="book-link-title">
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const isOverdue = record.status === "issued" && record.dueDate && new Date(record.dueDate) < new Date();
        return isOverdue ? <Tag color="volcano">OVERDUE</Tag> : getStatusTag(status);
      },
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
  ];

  // Map bookings to activity logs
  const activityLogs = activeBookings
    .map((b) => {
      if (b.status === "pending") {
        return {
          time: b.reservationDate,
          text: `Requested reservation for "${b.book?.title || 'Unknown Book'}"`,
          color: "orange"
        };
      }
      if (b.status === "approved") {
        return {
          time: b.reservationDate,
          text: `Reservation approved for "${b.book?.title || 'Unknown Book'}" (Ready for pickup)`,
          color: "blue"
        };
      }
      if (b.status === "issued") {
        return {
          time: b.issueDate || b.reservationDate,
          text: `Borrowed "${b.book?.title || 'Unknown Book'}" (Due: ${formatDate(b.dueDate)})`,
          color: "green"
        };
      }
      if (b.status === "returned") {
        return {
          time: b.returnDate || b.reservationDate,
          text: `Returned "${b.book?.title || 'Unknown Book'}"`,
          color: "gray"
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 4);

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
    <div className="student-dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={18}>
            <Title level={2} className="welcome-title">Welcome back, {user?.name || "Jane Student"}!</Title>
            <Text type="secondary">
              Track your borrowed books, active booking requests, and outstanding fees. {isDemo && "(Rendering demo data)"}
            </Text>
          </Col>
          <Col xs={24} md={6} className="profile-action-col">
            <Button type="primary" size="large" block onClick={() => navigate("/profile")} icon={<UserOutlined />}>
              View Profile Settings
            </Button>
          </Col>
        </Row>
      </div>

      {/* Warning Alert if overdue items exist */}
      {overdueBooks.length > 0 && (
        <Alert
          message="Overdue Lending Warning"
          description={`You have ${overdueBooks.length} book(s) past their return deadline. Overdue items accumulate fines at a rate of $5.00/day.`}
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 8 }}
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={6}>
          <Card className="stat-card total-borrowed" variant="borderless">
            <Statistic
              title="Total Books Borrowed"
              value={borrowedBooks.length}
              prefix={<BookOutlined style={{ color: "#10b981" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="stat-card active-reservations" variant="borderless">
            <Statistic
              title="Active Reservations"
              value={reservedBooks.length}
              prefix={<ClockCircleOutlined style={{ color: "#f59e0b" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="stat-card overdue-books" variant="borderless">
            <Statistic
              title="Overdue Books"
              value={overdueBooks.length}
              prefix={<WarningOutlined style={{ color: overdueBooks.length > 0 ? "#dc2626" : "#64748b" }} />}
              styles={{ content: { color: overdueBooks.length > 0 ? "#dc2626" : "inherit" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="stat-card outstanding-fines" variant="borderless">
            <Statistic
              title="Outstanding Fines"
              value={unpaidFines}
              prefix={<DollarCircleOutlined style={{ color: unpaidFines > 0 ? "#ef4444" : "#10b981" }} />}
              precision={2}
              styles={{ content: { color: unpaidFines > 0 ? "#dc2626" : "#059669" } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 8 }}>
        {/* Active reservations details table */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <BookOutlined />
                <span>My Active Bookings</span>
              </Space>
            } 
            extra={<Link to="/my-bookings" className="view-all-bookings-link">Full History <RightOutlined /></Link>}
            variant="borderless"
            className="bookings-table-card"
            loading={isLoadingBookings}
          >
            {activeBookings.length === 0 ? (
              <Empty
                description={
                  <Space direction="vertical" size={4} style={{ textAlign: "center" }}>
                    <Text strong>No active bookings</Text>
                    <Text type="secondary">Request book reservations from the digital catalogue.</Text>
                  </Space>
                }
              >
                <Button type="primary" onClick={() => navigate("/catalog")}>Browse Catalog</Button>
              </Empty>
            ) : (
              <Table
                dataSource={activeBookings.filter((b) => b.status !== "returned" && b.status !== "cancelled").slice(0, 5)}
                columns={columns}
                rowKey="_id"
                pagination={false}
                className="dashboard-table"
              />
            )}
          </Card>

          {/* Library Guidelines Card */}
          <Card 
            title={
              <Space>
                <InfoCircleOutlined style={{ color: "#6366f1" }} />
                <span>Library Reservation & Return Guidelines</span>
              </Space>
            }
            variant="borderless"
            className="guidelines-card-checklist"
            style={{ marginTop: 24 }}
          >
            <List
              dataSource={guidelines}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: "none", padding: "8px 0" }}>
                  <Space align="start">
                    <CheckSquareOutlined style={{ color: "#10b981", marginTop: "3px" }} />
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Sidebar activity timeline & Quick Actions */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {/* Quick Actions */}
            <Card title="Quick Action Panel" variant="borderless" className="shortcuts-card">
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Button type="primary" block size="large" onClick={() => navigate("/catalog")}>
                  Browse Catalog
                </Button>
                <Button block size="large" onClick={() => navigate("/my-bookings")}>
                  My Reservations
                </Button>
                <Button block size="large" onClick={() => navigate("/profile")}>
                  My Profile Info
                </Button>
              </Space>
            </Card>

            {/* Recent Activity */}
            <Card title="Recent Lending History" variant="borderless" className="activity-card">
              {activityLogs.length === 0 ? (
                <Empty description="No recent activities" />
              ) : (
                <Timeline 
                  style={{ marginTop: 8 }}
                  items={activityLogs.map((log) => ({
                    color: log.color,
                    children: (
                      <>
                        <Text strong style={{ display: "block", fontSize: "13px" }}>{log.text}</Text>
                        <Text type="secondary" style={{ fontSize: "11px" }}>{formatDate(log.time)}</Text>
                      </>
                    )
                  }))}
                />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

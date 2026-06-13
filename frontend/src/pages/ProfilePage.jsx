import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { Card, Avatar, Descriptions, Row, Col, Statistic, Typography, Divider, Space } from "antd";
import { UserOutlined, MailOutlined, SafetyCertificateOutlined, CalendarOutlined, BookOutlined, ClockCircleOutlined, DollarCircleOutlined } from "@ant-design/icons";
import "./ProfilePage.css";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user } = useAuth();
  const { bookings, books, fetchMyReservations, fetchBooks } = useLibrary();

  useEffect(() => {
    if (user?.role === "student") {
      fetchMyReservations();
    } else if (user?.role === "librarian") {
      fetchBooks({ limit: 100 });
    }
  }, [user, fetchMyReservations, fetchBooks]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Student calculations
  const studentActiveLoans = bookings.filter((b) => b.status === "issued").length;
  const studentTotalRequests = bookings.length;
  const studentTotalFines = bookings.reduce((sum, b) => {
    if (b.fine && !b.fine.paid) {
      return sum + b.fine.amount;
    }
    return sum;
  }, 0);

  return (
    <div className="profile-container">
      <Title level={2} className="profile-title">My Profile</Title>
      
      <Row gutter={[24, 24]}>
        {/* Profile Details Card */}
        <Col xs={24} md={8}>
          <Card className="profile-sidebar-card" bordered={false}>
            <div className="profile-avatar-wrapper">
              <Avatar 
                size={110} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: "#6366f1" }} 
              />
              <Title level={3} className="profile-sidebar-name">{user?.name}</Title>
              <TagColor role={user?.role} />
            </div>
            
            <Divider />
            
            <div className="profile-sidebar-info">
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div className="info-item">
                  <MailOutlined className="info-icon" />
                  <div>
                    <Text type="secondary" size="small" style={{ display: "block" }}>Email Address</Text>
                    <Text strong>{user?.email}</Text>
                  </div>
                </div>
                
                <div className="info-item">
                  <SafetyCertificateOutlined className="info-icon" />
                  <div>
                    <Text type="secondary" size="small" style={{ display: "block" }}>Role Access</Text>
                    <Text strong>{user?.role === "librarian" ? "Librarian / Administrator" : "Student / Borrower"}</Text>
                  </div>
                </div>
                
                <div className="info-item">
                  <CalendarOutlined className="info-icon" />
                  <div>
                    <Text type="secondary" size="small" style={{ display: "block" }}>Account Created</Text>
                    <Text strong>{formatDate(user?.createdAt)}</Text>
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Profile Statistics Column */}
        <Col xs={24} md={16}>
          <Card title="Account Overview" className="profile-overview-card" bordered={false}>
            {user?.role === "student" ? (
              <>
                <Text type="secondary">
                  Track your lending activity and billing status below. These values are updated instantly based on desk processing.
                </Text>
                
                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  <Col span={8}>
                    <Card bordered={false} className="mini-stat-card green">
                      <Statistic
                        title="Active Borrowed Books"
                        value={studentActiveLoans}
                        prefix={<BookOutlined />}
                        valueStyle={{ color: "#059669" }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card bordered={false} className="mini-stat-card blue">
                      <Statistic
                        title="Total Requests Filed"
                        value={studentTotalRequests}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "#2563eb" }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card bordered={false} className="mini-stat-card red">
                      <Statistic
                        title="Outstanding Fines"
                        value={studentTotalFines}
                        prefix={<DollarCircleOutlined />}
                        precision={2}
                        valueStyle={{ color: studentTotalFines > 0 ? "#dc2626" : "#4b5563" }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider style={{ margin: "30px 0 20px" }} />
                
                <Title level={4}>System Information</Title>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 12 }}>
                  <Descriptions.Item label="Unique User Identifier (UUID)">{user?._id}</Descriptions.Item>
                  <Descriptions.Item label="Database Storage Sync">MongoDB Connected</Descriptions.Item>
                  <Descriptions.Item label="Daily Overdue Fine Rate">$5.00 / day</Descriptions.Item>
                  <Descriptions.Item label="Standard Loan Period">14 Days</Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <>
                <Text type="secondary">
                  Librarian credentials provide full dashboard editing access. Below is catalog metadata summary.
                </Text>

                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  <Col span={12}>
                    <Card bordered={false} className="mini-stat-card blue">
                      <Statistic
                        title="Books catalogued"
                        value={books.length}
                        prefix={<BookOutlined />}
                        valueStyle={{ color: "#2563eb" }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card bordered={false} className="mini-stat-card purple">
                      <Statistic
                        title="System Privileges"
                        value="Librarian"
                        prefix={<SafetyCertificateOutlined />}
                        valueStyle={{ color: "#7c3aed" }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider style={{ margin: "30px 0 20px" }} />
                
                <Title level={4}>System Credentials</Title>
                <Descriptions bordered column={1} size="small" style={{ marginTop: 12 }}>
                  <Descriptions.Item label="Staff Member ID">{user?._id}</Descriptions.Item>
                  <Descriptions.Item label="Privilege Level">Administrator (Root Catalog & Bookings Modify)</Descriptions.Item>
                  <Descriptions.Item label="API Base Access">https://library-book-booking-system.onrender.com/api</Descriptions.Item>
                  <Descriptions.Item label="Session Token Storage">Local Web Storage (JWT Security)</Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function TagColor({ role }) {
  if (role === "librarian") {
    return <span className="profile-tag tag-librarian">LIBRARIAN</span>;
  }
  return <span className="profile-tag tag-student">STUDENT</span>;
}

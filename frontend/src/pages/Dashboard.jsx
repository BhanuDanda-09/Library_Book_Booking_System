import { useState, useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import { Tabs, Table, Tag, Button, Card, Space, Form, Input, InputNumber, Select, Drawer, Modal, Typography, Spin, Divider } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, BookOutlined, CalendarOutlined, UploadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import "./Dashboard.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Dashboard() {
  const {
    books,
    bookings,
    isLoadingBookings,
    isLoadingBooks,
    fetchBooks,
    fetchAllReservations,
    updateReservationStatus,
    addBook,
    updateBook,
    deleteBook
  } = useLibrary();

  const [form] = Form.useForm();
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState("reservations");
  const [resFilter, setResFilter] = useState("All");

  // Drawer / Book Modal Forms
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reservations and books
  useEffect(() => {
    if (activeTab === "reservations") {
      fetchAllReservations(resFilter);
    } else {
      fetchBooks({ limit: 100 }); // Retrieve a larger list for librarian management
    }
  }, [activeTab, resFilter, fetchAllReservations, fetchBooks]);

  const handleStatusChange = async (id, status) => {
    const res = await updateReservationStatus(id, status);
    if (res.success) {
      fetchAllReservations(resFilter);
    }
  };

  const handleOpenAddDrawer = () => {
    setEditingBook(null);
    setFile(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (book) => {
    setEditingBook(book);
    setFile(null);
    form.setFieldsValue({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.totalCopies,
      publisher: book.publisher || "",
      publishedYear: book.publishedYear || "",
      language: book.language || "English"
    });
    setIsDrawerOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("author", values.author);
    formData.append("isbn", values.isbn);
    formData.append("category", values.category);
    formData.append("totalCopies", values.totalCopies);
    formData.append("publisher", values.publisher || "");
    formData.append("publishedYear", values.publishedYear || "");
    formData.append("language", values.language || "English");
    
    if (file) {
      formData.append("coverImage", file);
    }

    let result;
    if (editingBook) {
      result = await updateBook(editingBook._id, formData);
    } else {
      result = await addBook(formData);
    }

    setIsSubmitting(false);
    if (result.success) {
      setIsDrawerOpen(false);
      fetchBooks({ limit: 100 });
    }
  };

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

  // Helper date formatter
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

  // Category map
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

  // Reservations Columns
  const reservationColumns = [
    {
      title: "Borrower Details",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <Space direction="vertical" size={1}>
          <strong>{user?.name || "Unknown User"}</strong>
          <Text type="secondary" size="small">{user?.email}</Text>
        </Space>
      )
    },
    {
      title: "Book Title",
      dataIndex: "book",
      key: "book",
      render: (book) => (
        <Space direction="vertical" size={1}>
          <strong>{book?.title || "Removed Book"}</strong>
          {book && <Text type="secondary" size="small">by {book.author}</Text>}
        </Space>
      )
    },
    {
      title: "Dates Timeline",
      key: "dates",
      render: (_, record) => (
        <Space direction="vertical" size={1} className="dates-timeline-text">
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
            <Text type="danger" strong>Fine: ${record.fine.amount} ({record.fine.paid ? "Paid" : "Unpaid"})</Text>
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
          <Text type="secondary" size="small">{record.author}</Text>
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
          <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenEditDrawer(record)}>
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
          <Text type="secondary">Manage book bookings, update library catalog, and handle returns</Text>
        </div>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="dash-tabs"
        items={[
          {
            key: "reservations",
            label: "Lending Reservations",
            children: (
              <div className="dash-tab-content">
                {/* Status Filtering */}
                <div className="res-filters">
                  <Text strong style={{ marginRight: 12 }}>Filter By Status:</Text>
                  <Radio.Group value={resFilter} onChange={(e) => setResFilter(e.target.value)} size="small">
                    <Radio.Button value="All">ALL</Radio.Button>
                    <Radio.Button value="Pending">PENDING</Radio.Button>
                    <Radio.Button value="Approved">APPROVED</Radio.Button>
                    <Radio.Button value="Issued">ISSUED</Radio.Button>
                    <Radio.Button value="Returned">RETURNED</Radio.Button>
                    <Radio.Button value="Cancelled">CANCELLED</Radio.Button>
                  </Radio.Group>
                </div>
                
                {isLoadingBookings ? (
                  <div className="dash-loading"><Spin size="large" tip="Loading reservations..." /></div>
                ) : (
                  <Table
                    dataSource={bookings}
                    columns={reservationColumns}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    className="dash-table"
                  />
                )}
              </div>
            )
          },
          {
            key: "books",
            label: "Book Catalogue",
            children: (
              <div className="dash-tab-content">
                <div className="catalog-actions-bar">
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddDrawer}>
                    Add New Book
                  </Button>
                </div>

                {isLoadingBooks ? (
                  <div className="dash-loading"><Spin size="large" tip="Loading book catalogue..." /></div>
                ) : (
                  <Table
                    dataSource={books}
                    columns={bookColumns}
                    rowKey="_id"
                    pagination={{ pageSize: 15 }}
                    className="dash-table"
                  />
                )}
              </div>
            )
          }
        ]}
      />

      {/* Book Add / Edit Drawer Form */}
      <Drawer
        title={editingBook ? "Edit Book Details" : "Add New Library Book"}
        width={480}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label="Book Title"
            rules={[{ required: true, message: "Please enter book title!" }]}
          >
            <Input placeholder="e.g. The Pragmatic Programmer" />
          </Form.Item>

          <Form.Item
            name="author"
            label="Author"
            rules={[{ required: true, message: "Please enter author name!" }]}
          >
            <Input placeholder="e.g. Robert C. Martin" />
          </Form.Item>

          <Form.Item
            name="isbn"
            label="ISBN Number"
            rules={[{ required: true, message: "Please enter unique ISBN!" }]}
          >
            <Input placeholder="e.g. 978-0132350884" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category / Genre"
                rules={[{ required: true, message: "Select category!" }]}
              >
                <Select placeholder="Select category">
                  <Option value="Fiction">Fiction</Option>
                  <Option value="Non-Fiction">Non-Fiction</Option>
                  <Option value="Science">Science</Option>
                  <Option value="Technology">Technology</Option>
                  <Option value="History">History</Option>
                  <Option value="Biography">Biography</Option>
                  <Option value="Mathematics">Mathematics</Option>
                  <Option value="Arts">Arts</Option>
                  <Option value="Philosophy">Philosophy</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalCopies"
                label="Total Copies"
                rules={[
                  { required: true, message: "Enter total copies!" },
                  { type: "number", min: 1, message: "Minimum 1 copy!" }
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="publisher" label="Publisher">
                <Input placeholder="e.g. Prentice Hall" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="publishedYear" label="Published Year">
                <InputNumber style={{ width: "100%" }} placeholder="e.g. 2008" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="language" label="Language">
            <Input placeholder="e.g. English" />
          </Form.Item>

          <div className="file-upload-block">
            <span className="file-upload-label">Book Cover Image</span>
            <input type="file" accept="image/*" onChange={handleFileChange} id="cover-file-input" />
            <label htmlFor="cover-file-input" className="file-upload-trigger">
              <UploadOutlined /> {file ? file.name : "Select Image File..."}
            </label>
            <Text type="secondary" size="small" style={{ display: "block", marginTop: 4 }}>
              Supports JPG, PNG (Max 5MB)
            </Text>
          </div>

          <Divider />

          <Space style={{ float: "right" }}>
            <Button onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {editingBook ? "Save Changes" : "Create Book"}
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
}

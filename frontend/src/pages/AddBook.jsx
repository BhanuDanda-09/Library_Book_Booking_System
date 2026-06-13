import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { Card, Form, Input, InputNumber, Select, Button, Typography, Space, Divider, Alert } from "antd";
import { ArrowLeftOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons";
import "./AddBook.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AddBook() {
  const { addBook } = useLibrary();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const onFinish = async (values) => {
    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("author", values.author);
    formData.append("isbn", values.isbn);
    formData.append("category", values.category);
    formData.append("totalCopies", values.totalCopies);
    formData.append("publisher", values.publisher || "");
    formData.append("publishedYear", values.publishedYear || "");
    formData.append("language", values.language || "English");
    formData.append("description", values.description || "");

    if (file) {
      formData.append("coverImage", file);
    }

    const result = await addBook(formData);
    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="add-book-container">
      {/* Back link */}
      <Link to="/dashboard" className="back-to-dash-link">
        <ArrowLeftOutlined /> Back to Dashboard
      </Link>

      <Card className="add-book-card" bordered={false}>
        <div className="add-book-header">
          <Title level={2} className="add-book-title">Add New Book</Title>
          <Text type="secondary">Introduce a new book to the catalog library index</Text>
        </div>

        {errorMsg && (
          <Alert
            message="Failed to add book"
            description={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg("")}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{ language: "English", totalCopies: 1 }}
        >
          <Form.Item
            name="title"
            label="Book Title"
            rules={[{ required: true, message: "Please enter the book title!" }]}
          >
            <Input placeholder="e.g. The Pragmatic Programmer" size="large" />
          </Form.Item>

          <Form.Item
            name="author"
            label="Author"
            rules={[{ required: true, message: "Please enter the author's name!" }]}
          >
            <Input placeholder="e.g. Robert C. Martin" size="large" />
          </Form.Item>

          <Form.Item
            name="isbn"
            label="ISBN Number"
            rules={[{ required: true, message: "Please enter the unique ISBN number!" }]}
          >
            <Input placeholder="e.g. 978-0132350884" size="large" />
          </Form.Item>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="category"
                label="Category / Genre"
                rules={[{ required: true, message: "Please select a category!" }]}
              >
                <Select placeholder="Select category" size="large">
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="totalCopies"
                label="Total Copies"
                rules={[
                  { required: true, message: "Please enter the total copies!" },
                  { type: "number", min: 1, message: "Minimum is 1 copy!" }
                ]}
              >
                <InputNumber min={1} style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="publisher" label="Publisher">
                <Input placeholder="e.g. Prentice Hall" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="publishedYear" label="Published Year">
                <InputNumber style={{ width: "100%" }} placeholder="e.g. 2008" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="language" label="Language">
                <Input placeholder="e.g. English" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <div className="file-upload-block">
                <span className="file-upload-label">Book Cover Image</span>
                <input type="file" accept="image/*" onChange={handleFileChange} id="add-cover-file-input" style={{ display: "none" }} />
                <label htmlFor="add-cover-file-input" className="file-upload-trigger">
                  <UploadOutlined /> {file ? file.name : "Choose Cover Image File..."}
                </label>
              </div>
            </Col>
          </Row>

          <Form.Item name="description" label="Description / Summary">
            <Input.TextArea placeholder="Enter a brief summary of the book..." rows={4} />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ float: "right" }}>
              <Button size="large" onClick={() => navigate("/dashboard")}>Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                loading={isSubmitting}
                icon={<PlusOutlined />}
              >
                Add Book to Catalog
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

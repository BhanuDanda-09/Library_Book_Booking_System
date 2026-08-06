import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import API from "../services/api";
import { Card, Form, Input, InputNumber, Select, Button, Typography, Space, Divider, Alert, Spin, Row, Col } from "antd";
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined } from "@ant-design/icons";
import "./EditBook.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function EditBook() {
  const { id } = useParams();
  const { updateBook } = useLibrary();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const res = await API.get(`/books/${id}`);
        if (res.data.success) {
          const book = res.data.book;
          form.setFieldsValue({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            category: book.category,
            totalCopies: book.totalCopies,
            publisher: book.publisher || "",
            publishedYear: book.publishedYear || "",
            language: book.language || "English",
            description: book.description || ""
          });
        } else {
          setErrorMsg("Book details could not be found.");
        }
      } catch (err) {
        console.error("Fetch book error:", err);
        setErrorMsg(err.response?.data?.message || "Failed to load book details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, form]);

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

    const result = await updateBook(id, formData);
    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setErrorMsg(result.message);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-book-loading">
        <Spin size="large" tip="Loading book details..." />
      </div>
    );
  }

  return (
    <div className="edit-book-container">
      {/* Back link */}
      <Link to="/dashboard" className="back-to-dash-link">
        <ArrowLeftOutlined /> Back to Dashboard
      </Link>

      <Card className="edit-book-card" bordered={false}>
        <div className="edit-book-header">
          <Title level={2} className="edit-book-title">Edit Book Details</Title>
          <Text type="secondary">Modify information parameters for this library entry</Text>
        </div>

        {errorMsg && (
          <Alert
            message="Failed to load or update book"
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
        >
          <Form.Item
            name="title"
            label="Book Title"
            rules={[{ required: true, message: "Please enter the book title!" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            name="author"
            label="Author"
            rules={[{ required: true, message: "Please enter the author's name!" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            name="isbn"
            label="ISBN Number"
            rules={[{ required: true, message: "Please enter the unique ISBN number!" }]}
          >
            <Input size="large" />
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
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="publishedYear" label="Published Year">
                <InputNumber style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item name="language" label="Language">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <div className="file-upload-block">
                <span className="file-upload-label">Update Cover Image</span>
                <input type="file" accept="image/*" onChange={handleFileChange} id="edit-cover-file-input" style={{ display: "none" }} />
                <label htmlFor="edit-cover-file-input" className="file-upload-trigger">
                  <UploadOutlined /> {file ? file.name : "Choose New Cover File..."}
                </label>
              </div>
            </Col>
          </Row>

          <Form.Item name="description" label="Description / Summary">
            <Input.TextArea rows={4} />
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
                icon={<SaveOutlined />}
              >
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

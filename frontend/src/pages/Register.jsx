import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Form, Input, Button, Select, Typography, Space, Alert, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, SolutionOutlined } from "@ant-design/icons";
import "./Register.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onFinish = async (values) => {
    setIsLoading(true);
    setErrorMsg("");
    const { name, email, password, role } = values;

    const result = await register(name, email, password, role);
    setIsLoading(false);

    if (result.success) {
      message.success("Registration successful! Please sign in with your credentials.");
      navigate("/login");
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="register-page-container">
      <Card className="register-card" bordered={false}>
        <div className="register-card-header">
          <span className="register-logo">📚</span>
          <Title level={2} className="register-title">Create Account</Title>
          <Text type="secondary">Join the Aetherius Library system</Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg("")}
            style={{ marginBottom: 20 }}
          />
        )}

        <Form
          form={form}
          name="register_form"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{ role: "student" }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your full name!" }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />} 
              placeholder="e.g. John Doe" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Please enter a valid email address!" }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />} 
              placeholder="e.g. john@example.com" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Account Type / Role"
            rules={[{ required: true, message: "Please select your role!" }]}
          >
            <Select size="large" suffixIcon={<SolutionOutlined style={{ color: "rgba(0,0,0,.25)" }} />}>
              <Option value="student">Student / Borrower</Option>
              <Option value="librarian">Librarian / Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter a password!" },
              { min: 6, message: "Password must be at least 6 characters long!" }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Password (minimum 6 characters)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("The two passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Repeat password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 10 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
              className="btn-register-submit"
            >
              Register Now
            </Button>
          </Form.Item>
        </Form>

        <div className="register-card-footer">
          <Text>Already have an account? </Text>
          <Link to="/login" className="login-link-toggle">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}

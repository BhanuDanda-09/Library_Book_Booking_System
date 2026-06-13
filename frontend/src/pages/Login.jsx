import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Form, Input, Button, Typography, Space, Alert } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import "./Login.css";

const { Title, Text } = Typography;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onFinish = async (values) => {
    setIsLoading(true);
    setErrorMsg("");
    const { email, password } = values;
    
    const result = await login(email, password);
    setIsLoading(false);
    
    if (result.success) {
      navigate("/");
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="login-page-container">
      <Card className="login-card" bordered={false}>
        <div className="login-card-header">
          <span className="login-logo">📚</span>
          <Title level={2} className="login-title">Welcome Back</Title>
          <Text type="secondary">Access your Aetherius Library account</Text>
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
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
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
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
              icon={<LoginOutlined />}
              className="btn-login-submit"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="login-card-footer">
          <Text>Don't have an account? </Text>
          <Link to="/register" className="register-link-toggle">
            Create account
          </Link>
        </div>
      </Card>
    </div>
  );
}

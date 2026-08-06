import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import "./Auth.css";

export default function Login() {
  const [formData, setFormData]     = useState({ email: "", password: "" });
  const [showPwd, setShowPwd]       = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const { login }                   = useAuth();
  const navigate                    = useNavigate();

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    const result = await login(formData.email, formData.password);
    setIsLoading(false);
    if (result?.success) {
      toast.success("Welcome back! 👋");
      navigate("/");
    } else {
      toast.error(result?.message || "Invalid credentials.");
    }
  };

  // Quick demo fill
  const fillDemo = (role) => {
    const demos = {
      admin:     { email: "admin@library.com",          password: "Admin@123" },
      librarian: { email: "librarian@library.com",      password: "Lib@12345" },
      student:   { email: "aarav.sharma@student.edu",   password: "Student@1" },
    };
    setFormData(demos[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left panel */}
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-brand">📚 SmartLibrary</div>
            <h2 className="auth-left-title">Your library,<br />in your pocket.</h2>
            <p className="auth-left-sub">
              Reserve books, track loans, and get notified — all from one beautiful dashboard.
            </p>
            <div className="auth-quote">
              <blockquote>"A reader lives a thousand lives before he dies."</blockquote>
              <cite>— George R.R. Martin</cite>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-right">
          <div className="auth-card animate-scaleIn">
            <div className="auth-card-header">
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in to your SmartLibrary account</p>
            </div>

            {/* Demo quick-login */}
            <div className="auth-demo-btns">
              <p className="auth-demo-label">Quick Demo Login:</p>
              <div className="auth-demo-row">
                {[["admin","🛡️ Admin"],["librarian","📚 Librarian"],["student","🎓 Student"]].map(([role, label]) => (
                  <button key={role} className={`demo-btn demo-btn-${role}`} onClick={() => fillDemo(role)} type="button">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email" name="email" type="email" autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="auth-link-sm">Forgot password?</Link>
                </div>
                <div className="input-icon-wrap">
                  <input
                    id="password" name="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : "Sign In"}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">Join SmartLibrary</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

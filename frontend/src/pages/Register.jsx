import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import "./Auth.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "student", phone: "", studentId: "", department: "",
  });
  const [showPwd, setShowPwd]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register }              = useAuth();
  const navigate                  = useNavigate();

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    const { confirmPassword, ...payload } = formData;
    const result = await register(payload);
    setIsLoading(false);
    if (result?.success) {
      toast.success("Account created! Please sign in. 🎉");
      navigate("/login");
    } else {
      toast.error(result?.message || "Registration failed.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left panel */}
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-brand">📚 SmartLibrary</div>
            <h2 className="auth-left-title">Join our<br />reading community.</h2>
            <p className="auth-left-sub">
              Create your free account and unlock access to 88+ books across 15 categories.
            </p>
            <div className="auth-perks">
              {["📚 Reserve books instantly", "🔔 Due date reminders", "♻️ Renew books online", "❤️ Build your wishlist"].map(p => (
                <div key={p} className="auth-perk">{p}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-right">
          <div className="auth-card animate-scaleIn">
            <div className="auth-card-header">
              <h1 className="auth-title">Create account</h1>
              <p className="auth-subtitle">Fill in the details below to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" type="text" placeholder="Aarav Sharma"
                  value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email" placeholder="you@example.com"
                  value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="role">I am a…</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="librarian">Librarian</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="studentId">{formData.role === "librarian" ? "Staff ID" : "Student ID"}</label>
                  <input id="studentId" name="studentId" type="text" placeholder="STU2024001"
                    value={formData.studentId} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone (optional)</label>
                  <input id="phone" name="phone" type="tel" placeholder="+91-9800000001"
                    value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input id="department" name="department" type="text" placeholder="Computer Science"
                  value={formData.department} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-icon-wrap">
                  <input id="password" name="password" type={showPwd ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={formData.password} onChange={handleChange} required />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword"
                  type={showPwd ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={formData.confirmPassword} onChange={handleChange} required />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : "Create Account →"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

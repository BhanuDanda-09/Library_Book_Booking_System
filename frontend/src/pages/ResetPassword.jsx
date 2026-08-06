import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import "./Auth.css";

export default function ResetPassword() {
  const { token }               = useParams();
  const { resetPassword }       = useAuth();
  const navigate                = useNavigate();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPwd, setShowPwd]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match."); return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }
    setIsLoading(true);
    const result = await resetPassword(token, formData.password);
    setIsLoading(false);
    if (result?.success) {
      toast.success("Password reset! You are now signed in. 🎉");
      navigate("/");
    } else {
      toast.error(result?.message || "Reset failed. Link may have expired.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-brand">📚 SmartLibrary</div>
            <h2 className="auth-left-title">Create a<br />new password.</h2>
            <p className="auth-left-sub">Choose a strong password to keep your account secure.</p>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card animate-scaleIn">
            <div className="auth-card-header">
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
              <h1 className="auth-title">Set new password</h1>
              <p className="auth-subtitle">Must be at least 6 characters.</p>
            </div>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="input-icon-wrap">
                  <input id="password" type={showPwd ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} required />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input id="confirmPassword" type={showPwd ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

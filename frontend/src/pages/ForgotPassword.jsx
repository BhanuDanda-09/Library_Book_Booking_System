import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail]       = useState("");
  const [sent, setSent]         = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword }      = useAuth();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email."); return; }
    setIsLoading(true);
    const result = await forgotPassword(email);
    setIsLoading(false);
    if (result?.success) {
      setSent(true);
      toast.success("Reset instructions sent!");
    } else {
      toast.error(result?.message || "Something went wrong.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-brand">📚 SmartLibrary</div>
            <h2 className="auth-left-title">Reset your<br />password.</h2>
            <p className="auth-left-sub">
              Enter your registered email and we'll send you a secure link to reset your password.
            </p>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card animate-scaleIn">
            {!sent ? (
              <>
                <div className="auth-card-header">
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                  <h1 className="auth-title">Forgot password?</h1>
                  <p className="auth-subtitle">No worries — we'll send you a reset link.</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input id="email" type="email" placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                    {isLoading ? <span className="auth-spinner" /> : "Send Reset Link"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
                <h2 style={{ marginBottom: 8 }}>Check your email</h2>
                <p style={{ color: "var(--color-text-3)", marginBottom: 24 }}>
                  If <strong>{email}</strong> is registered, a reset link has been sent. Check your inbox.
                </p>
                <button onClick={() => setSent(false)} className="auth-submit-btn" style={{ width: "auto", padding: "10px 24px" }}>
                  Try another email
                </button>
              </div>
            )}
            <p className="auth-switch">
              Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

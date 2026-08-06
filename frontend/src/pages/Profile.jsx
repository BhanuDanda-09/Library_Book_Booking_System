import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { Tabs } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import "./Profile.css";

export default function Profile() {
  const { user, updateProfile, uploadProfilePicture, changePassword } = useAuth();
  const { wishlist, fetchWishlist } = useLibrary();
  const fileRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name:       user?.name || "",
    phone:      user?.phone || "",
    studentId:  user?.studentId || "",
    department: user?.department || "",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPic, setUploadingPic]     = useState(false);

  const handleProfileChange = e =>
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProfileSave = async e => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile(profileData);
    setSavingProfile(false);
  };

  const handlePasswordSave = async e => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match."); return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }
    setSavingPassword(true);
    await changePassword(passwords.currentPassword, passwords.newPassword);
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setSavingPassword(false);
  };

  const handlePictureChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large. Max 5MB."); return; }
    const formData = new FormData();
    formData.append("profilePicture", file);
    setUploadingPic(true);
    await uploadProfilePicture(formData);
    setUploadingPic(false);
  };

  const getRoleBadge = () => {
    const map = { admin: { label: "Admin", bg: "#6366f1" }, librarian: { label: "Librarian", bg: "#10b981" }, student: { label: "Student", bg: "#8b5cf6" } };
    return map[user?.role] || map.student;
  };
  const badge = getRoleBadge();

  const tabItems = [
    {
      key: "profile",
      label: "Profile Info",
      children: (
        <form onSubmit={handleProfileSave} className="profile-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" value={profileData.name} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" type="tel" value={profileData.phone} onChange={handleProfileChange} placeholder="+91-0000000000" />
            </div>
            <div className="form-group">
              <label>{user?.role === "librarian" ? "Staff ID" : "Student ID"}</label>
              <input name="studentId" type="text" value={profileData.studentId} onChange={handleProfileChange} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input name="department" type="text" value={profileData.department} onChange={handleProfileChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Email (cannot be changed)</label>
            <input type="email" value={user?.email || ""} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input type="text" value={user?.role} disabled style={{ opacity: 0.6, textTransform: "capitalize" }} />
          </div>
          <button type="submit" className="profile-save-btn" disabled={savingProfile}>
            {savingProfile ? <span className="auth-spinner" style={{ width: 18, height: 18 }} /> : "Save Changes"}
          </button>
        </form>
      ),
    },
    {
      key: "security",
      label: "Security",
      children: (
        <form onSubmit={handlePasswordSave} className="profile-form">
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={passwords.currentPassword}
              onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={passwords.newPassword} placeholder="At least 6 characters"
              onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" value={passwords.confirmPassword}
              onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required />
          </div>
          <button type="submit" className="profile-save-btn" disabled={savingPassword}>
            {savingPassword ? <span className="auth-spinner" style={{ width: 18, height: 18 }} /> : "Change Password"}
          </button>
        </form>
      ),
    },
  ];

  return (
    <div className="profile-page page-wrapper animate-fadeInUp">
      <h1 className="profile-page-title">My Profile</h1>

      <div className="profile-layout">
        {/* Left: Avatar card */}
        <div className="profile-avatar-card">
          <div className="profile-avatar-wrap">
            {user?.profilePicture
              ? <img src={user.profilePicture} alt={user.name} className="profile-avatar-img" />
              : <div className="profile-avatar-placeholder"><UserOutlined /></div>
            }
            <button
              className="profile-camera-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPic}
              title="Change photo"
            >
              {uploadingPic ? <span className="auth-spinner" style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,.3)", borderTopColor: "#fff" }} /> : <CameraOutlined />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePictureChange} />
          </div>

          <h2 className="profile-name">{user?.name}</h2>
          <span className="profile-role-badge" style={{ background: badge.bg }}>{badge.label}</span>

          <div className="profile-info-list">
            {user?.email      && <div className="profile-info-item"><span>✉️</span><span>{user.email}</span></div>}
            {user?.studentId  && <div className="profile-info-item"><span>🎓</span><span>{user.studentId}</span></div>}
            {user?.department && <div className="profile-info-item"><span>🏢</span><span>{user.department}</span></div>}
            {user?.phone      && <div className="profile-info-item"><span>📱</span><span>{user.phone}</span></div>}
            <div className="profile-info-item">
              <span>📅</span>
              <span>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}</span>
            </div>
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="profile-tabs-card">
          <Tabs items={tabItems} defaultActiveKey="profile" />
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem("token") || "");
  const [isLoading, setIsLoading] = useState(true);

  // ── Initialize auth from stored token ────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await API.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            _clearAuth();
          }
        } catch {
          _clearAuth();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [token]);

  const _clearAuth = () => {
    localStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];
    setToken("");
    setUser(null);
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem("token", userToken);
        API.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
        setToken(userToken);
        setUser(userData);
        setIsLoading(false);
        return { success: true };
      }
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: err.response?.data?.message || "Login failed." };
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (data) => {
    setIsLoading(true);
    try {
      const res = await API.post("/auth/register", data);
      setIsLoading(false);
      if (res.data.success) return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: err.response?.data?.message || "Registration failed." };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    _clearAuth();
    toast.success("Logged out successfully");
  };

  // ── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = async (data) => {
    try {
      const res = await API.put("/auth/update-profile", data);
      if (res.data.success) {
        setUser(res.data.user);
        toast.success("Profile updated!");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ── Upload Profile Picture ────────────────────────────────────────────────
  const uploadProfilePicture = async (formData) => {
    try {
      const res = await API.post("/auth/upload-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success("Profile picture updated!");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to upload picture.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ── Change Password ───────────────────────────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await API.put("/auth/change-password", { currentPassword, newPassword });
      if (res.data.success) {
        toast.success("Password changed successfully!");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ── Forgot Password ───────────────────────────────────────────────────────
  const forgotPassword = async (email) => {
    try {
      const res = await API.post("/auth/forgot-password", { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed." };
    }
  };

  // ── Reset Password ────────────────────────────────────────────────────────
  const resetPassword = async (token, password) => {
    try {
      const res = await API.put(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem("token", userToken);
        API.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Reset failed." };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      login, register, logout,
      updateProfile, uploadProfilePicture, changePassword,
      forgotPassword, resetPassword,
      isAuthenticated: !!user,
      isStudent:   user?.role === "student",
      isLibrarian: user?.role === "librarian",
      isAdmin:     user?.role === "admin",
      isStaff:     user?.role === "librarian" || user?.role === "admin",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

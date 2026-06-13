import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import BookDetail from "../pages/BookDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import MyBookings from "../pages/MyBookings";
import Dashboard from "../pages/Dashboard";
import { Spin } from "antd";

// Wrapper for checking if user is authenticated and matches required role
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin size="large" tip="Loading authentication status..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to default page depending on their role
    return <Navigate to={user.role === "librarian" ? "/dashboard" : "/"} replace />;
  }

  return children;
}

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/book/:id" element={<BookDetail />} />
      
      {/* Auth Redirects: Redirect logged-in users away from Login/Register */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === "librarian" ? "/dashboard" : "/"} replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === "librarian" ? "/dashboard" : "/"} replace />
          ) : (
            <Register />
          )
        } 
      />

      {/* Student Protected Routes */}
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* Librarian Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["librarian"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

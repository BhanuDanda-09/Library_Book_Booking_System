import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuth } from "../context/AuthContext";

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Home           = lazy(() => import("../pages/Home"));
const Catalog        = lazy(() => import("../pages/Catalog"));
const BookDetail     = lazy(() => import("../pages/BookDetail"));
const Login          = lazy(() => import("../pages/Login"));
const Register       = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword  = lazy(() => import("../pages/ResetPassword"));
const MyBookings     = lazy(() => import("../pages/MyBookings"));
const Profile        = lazy(() => import("../pages/Profile"));
const Dashboard      = lazy(() => import("../pages/Dashboard"));
const Notifications  = lazy(() => import("../pages/Notifications"));
const Wishlist       = lazy(() => import("../pages/Wishlist"));
const StudentDashboard  = lazy(() => import("../pages/StudentDashboard"));
const AddBook           = lazy(() => import("../pages/AddBook"));
const EditBook          = lazy(() => import("../pages/EditBook"));
const ManageReservations = lazy(() => import("../pages/ManageReservations"));

// ── Full-screen loader ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%",
        border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)",
        animation: "spin 0.7s linear infinite" }} />
      <p style={{ color: "var(--color-text-3)", fontSize: "var(--text-sm)" }}>Loading…</p>
    </div>
  );
}

// ── Route guards ──────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function StaffRoute({ children }) {
  const { isAuthenticated, isStaff, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isStaff)         return <Navigate to="/"     replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function StudentRoute({ children }) {
  const { isAuthenticated, isStudent, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isStudent)       return <Navigate to="/"     replace />;
  return children;
}

// ── App Routes ────────────────────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"        element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/book/:id" element={<BookDetail />} />

        {/* Guest only */}
        <Route path="/login"           element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register"        element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Authenticated */}
        <Route path="/my-bookings"   element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/profile"       element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/wishlist"      element={<PrivateRoute><Wishlist /></PrivateRoute>} />

        {/* Staff only */}
        <Route path="/dashboard" element={<StaffRoute><Dashboard /></StaffRoute>} />
        <Route path="/dashboard/add-book"           element={<StaffRoute><AddBook /></StaffRoute>} />
        <Route path="/dashboard/edit-book/:id"      element={<StaffRoute><EditBook /></StaffRoute>} />
        <Route path="/dashboard/reservations"       element={<StaffRoute><ManageReservations /></StaffRoute>} />

        {/* Student only */}
        <Route path="/student-dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h1 style={{ marginBottom: 8 }}>Page Not Found</h1>
            <p style={{ color: "var(--color-text-3)", marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
            <a href="/" style={{ color: "var(--color-primary)", fontWeight: 700 }}>← Back to Home</a>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

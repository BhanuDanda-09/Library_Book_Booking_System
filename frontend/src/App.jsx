import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import AppRoutes from "./Routes/AppRoutes";
import ScrollToTop from "./components/ui/ScrollToTop";
import "./App.css";

function AppContent() {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary:  "#6366f1",
          colorSuccess:  "#10b981",
          colorWarning:  "#f59e0b",
          colorError:    "#ef4444",
          colorInfo:     "#3b82f6",
          borderRadius:  10,
          fontFamily:    "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          colorBgBase:   isDark ? "#151f2e" : "#ffffff",
          colorTextBase: isDark ? "#f1f5f9" : "#0f172a",
        },
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <LibraryProvider>
            <div className="app-container">
              <NavBar />
              <main className="main-layout">
                <AppRoutes />
              </main>
              <Footer />
              <ScrollToTop />
            </div>
            {/* React Hot Toast — premium notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  fontFamily: "'Outfit', sans-serif",
                  fontSize:   "14px",
                  fontWeight: 500,
                  borderRadius: "10px",
                  padding: "12px 16px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  background: isDark ? "#1e293b" : "#ffffff",
                  color:      isDark ? "#f1f5f9"  : "#0f172a",
                  border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                },
                success: {
                  iconTheme: { primary: "#10b981", secondary: "#fff" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "#fff" },
                },
              }}
            />
          </LibraryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
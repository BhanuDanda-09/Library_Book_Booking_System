import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import AppRoutes from "./Routes/AppRoutes";
import "./App.css";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6366f1", // Modern indigo
          colorSuccess: "#10b981", // Emerald green
          colorWarning: "#f59e0b", // Amber
          colorError: "#ef4444", // Crimson
          colorInfo: "#3b82f6", // Royal blue
          borderRadius: 8, // Soft rounded borders
          fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        algorithm: theme.defaultAlgorithm,
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
            </div>
          </LibraryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
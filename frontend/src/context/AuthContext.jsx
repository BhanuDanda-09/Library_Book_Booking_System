import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load user profile if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await API.get("/auth/me");
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Auth initialization failed:", err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Login handler
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
      return {
        success: false,
        message: err.response?.data?.message || "Login failed. Please check your credentials."
      };
    }
  };

  // Register handler
  const register = async (name, email, password, role) => {
    setIsLoading(true);
    try {
      const res = await API.post("/auth/register", { name, email, password, role });
      setIsLoading(false);
      if (res.data.success) {
        return { success: true };
      }
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed. Email might already be registered."
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isStudent: user?.role === "student",
        isLibrarian: user?.role === "librarian"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

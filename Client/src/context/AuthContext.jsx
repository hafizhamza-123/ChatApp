import { createContext, useState, useEffect, useContext } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Validate token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/users/profile");

        // ✅ backend returns { success, data }
        setUser(res.data.data);
      } catch (err) {
        console.error("Token validation failed:", err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 📝 Register
  const register = async (email, username, password) => {
    try {
      const res = await API.post("/users/register", {
        email,
        username,
        password,
      });

      return {
        success: true,
        message: res.data.message,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  // 🔑 Login
  const login = async (email, password) => {
    try {
      const res = await API.post("/users/login", { email, password });

      // ✅ correct destructuring
      const { user, token } = res.data.data;

      localStorage.setItem("token", token);
      setUser(user);

      return { success: true, user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  // 🚪 Logout (No backend logout route exists)
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

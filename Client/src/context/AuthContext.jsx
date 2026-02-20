import { createContext, useState, useEffect, useContext } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/users/profile");
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

  // Register
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

  // Login
  const login = async (email, password) => {
    try {
      const res = await API.post("/users/login", { email, password });
      const { user, token, refreshToken } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);

      return { success: true, user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };


  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await API.post("/users/logout");
    } catch (err) {
      // Ignore errors, proceed with logout
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setLoading(false);
      window.location.replace("/login");
    }
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

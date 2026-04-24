import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "./context/useAuth";
import Chat from "./components/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : "");

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [socketInstance, setSocketInstance] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user || !SOCKET_URL) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      setSocketInstance(socket);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setSocketInstance(null);
    });

    return () => {
      socket.disconnect();
      setSocketInstance(null);
    };
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/chat" replace />}
      />

      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/chat" replace />}
      />
      <Route
        path="/verify-otp"
        element={<VerifyOtp />} />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />} />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />} />

      {/* Protected Route */}
      <Route
        path="/chat"
        element={
          user ? (
            <Chat
              socket={socketInstance}
              user={user}
              connected={connected}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/chat" replace />} />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "./context/AuthContext";
import Chat from "./components/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
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

      {/* Protected Route */}
      <Route
        path="/chat"
        element={
          user ? (
            <Chat
              socket={socketRef.current}
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

import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectToDatabase from "./src/config/connectToDatabase.js";
import createApp from "./src/createApp.js";
import validateEnv from "./src/config/validateEnv.js";

dotenv.config();
validateEnv();

const PORT = process.env.PORT || 3000;
const app = createApp();

const activeUsers = new Map();
const socketAllowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .flatMap((value) => value.split(",").map((origin) => origin.trim()))
  .filter(Boolean);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin:
      socketAllowedOrigins.length > 0
        ? socketAllowedOrigins
        : ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register User
  socket.on("join_chat", ({ username, userId }) => {
    activeUsers.set(socket.id, { username, userId });

    io.emit("user_joined", {
      username,
      userId,
      activeUsers: Array.from(activeUsers.values()),
    });

    console.log(`${username} joined the chat`);
  });

  // Join Room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Send Message
  socket.on("send_message", ({ senderId, text, timestamp, room, fileUrl, fileType, fileName }) => {
    const sender = activeUsers.get(socket.id);

    if (!sender) {
      console.log("Unregistered user tried to send message");
      return;
    }

    const message = {
      senderId,
      senderName: sender.username,
      text,
      timestamp: timestamp || new Date().toISOString(),
      room,
    };

    // Add file metadata if present
    if (fileUrl) message.fileUrl = fileUrl;
    if (fileType) message.fileType = fileType;
    if (fileName) message.fileName = fileName;

    if (room) {
      io.to(room).emit("receive_message", message);
    }
  });

  // Typing Indicator
  socket.on("typing", ({ room, isTyping }) => {
  const user = activeUsers.get(socket.id);
  if (!user || !room) return;

  socket.to(room).emit("user_typing", {
    userId: user.userId,
    username: user.username,
    isTyping,
    });
  });


  //Disconnect
  socket.on("disconnect", () => {
    const user = activeUsers.get(socket.id);

    if (user) {
      activeUsers.delete(socket.id);

      io.emit("user_left", {
        username: user.username,
        userId: user.userId,
        activeUsers: Array.from(activeUsers.values()),
      });

      console.log(`${user.username} disconnected`);
    } else {
      console.log("Unknown user disconnected:", socket.id);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
  connectToDatabase();
});

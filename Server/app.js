import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectToDatabase from "./src/config/connectToDatabase.js";
import centralRoutes from "./src/routes/index.route.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

const activeUsers = new Map();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", centralRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// // room name for 1-1 chat 
// function getPrivateRoomId(userA, userB) {
//   const ids = [userA, userB].sort();
//   return `private:${ids[0]}:${ids[1]}`;
// }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("welcome", { message: "Welcome to the chat server!", id: socket.id });
  socket.on("join_chat", (userData) => {
    const { username, userId } = userData;
    activeUsers.set(socket.id, { username, userId, socketId: socket.id });

    io.emit("user_joined", {
      username,
      userId,
      activeUsers: Array.from(activeUsers.values()),
    });

    console.log(`${username} joined the chat`);
  });

  socket.on("join_room", (room) => {
    socket.join(room);
    socket.emit("room_joined", room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on("leave_room", (room) => {
    socket.leave(room);
    socket.emit("room_left", room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  socket.on("send_message", (messageData) => {
    const { senderId, text, timestamp, room } = messageData;
    const sender = activeUsers.get(socket.id);

    if (!sender) {
      socket.emit("error", "User not registered");
      return;
    }

    const message = {
      senderId,
      senderName: sender.username,
      text,
      timestamp: timestamp || new Date().toISOString(),
      room: room || "global",
    };

    if (room) {
      io.to(room).emit("receive_message", message);
    } else {
      io.emit("receive_message", message);
    }

    socket.emit("message_sent", message);
  });

  // Typing status
  // socket.on("typing", ({ room, isTyping }) => {
  //   const user = activeUsers.get(socket.id);
  //   if (!user) return;

  //   const payload = { userId: user.userId, username: user.username, isTyping };

  //   if (room) {
  //     socket.to(room).emit("user_typing", payload);
  //   } else {
  //     socket.broadcast.emit("user_typing", payload);
  //   }
  // });

  socket.on("start_private", ({ targetUserId }) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;
    const privateRoom = getPrivateRoomId(user.userId, targetUserId);
    socket.join(privateRoom);
    socket.emit("private_room", { room: privateRoom, targetUserId });

    for (const [sid, u] of activeUsers.entries()) {
      if (u.userId === targetUserId) {
        io.to(sid).emit("private_room", { room: privateRoom, targetUserId: user.userId });
        io.sockets.sockets.get(sid)?.join(privateRoom);
        break;
      }
    }
  });

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

  socket.on("error", (error) => {
    console.error("Socket error:", error);
    socket.emit("error", "An error occurred");
  });
});


httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
  connectToDatabase()
});

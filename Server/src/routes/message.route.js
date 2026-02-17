import { Router } from "express";
import {
  getAllMessages,
  createMessage,
  getUnreadCount, 
  uploadMessage
} from "../controllers/message.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all messages of a chat
router.get("/:chatId", getAllMessages);

// Create a new message in a chat
router.post("/create/:chatId", createMessage);

// Upload file message
router.post("/upload/:chatId", upload.single("file"), uploadMessage);

// Get unread message count 
router.get("/:chatId/unread-count", getUnreadCount);

export default router;

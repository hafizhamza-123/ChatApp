import { Router } from "express";
import {
  getAllMessages,
  createMessage,
  getUnreadCount
} from "../controllers/message.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all messages of a chat
router.get("/:chatId", getAllMessages);

// Create a new message in a chat
router.post("/create/:chatId", createMessage);

// Get unread message count (basic version)
router.get("/:chatId/unread-count", getUnreadCount);

export default router;

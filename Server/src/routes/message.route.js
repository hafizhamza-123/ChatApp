import { Router } from "express";
import {
  getAllMessages,
  createMessage,
  getUnreadCount, 
  uploadMessage, 
  markMessagesAsDelivered,
  markMessagesAsRead,
  getMessageReadReceipts,
  getMessagesWithReadStatus,
  getChatReadSummary
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

// Mark Messages as delivered when user opens chat
router.post('/:chatId/delivered', markMessagesAsDelivered);

// Mark Messages as read when user views them
router.put('/:chatId/read', markMessagesAsRead);

// Get read receipts for a message
router.get('/receipt/:messageId', getMessageReadReceipts);

// Get messages with read status for a chat
router.get('/:chatId/with-status', getMessagesWithReadStatus);

// Get Summary of read/unread messages for a chat
router.get('/:chatId/summary', getChatReadSummary);

export default router;

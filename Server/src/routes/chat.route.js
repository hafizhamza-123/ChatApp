import { Router } from "express";
import { createDirectChat, createGroupChat, fetchUserChats, getChatById } from '../controllers/chat.controller.js';
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create direct chat
router.post('/direct',  createDirectChat);

// Create group chat
router.post('/group', createGroupChat);

// Fetch user's chats
router.get('/', fetchUserChats);

// Get specific chat
router.get('/:chatId', getChatById);

export default router;
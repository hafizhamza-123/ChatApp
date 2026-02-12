import { Router } from "express";

import { registerUser, loginUser, getAllUsers, getUserProfile, logoutUser } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js"

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/all", authenticate, getAllUsers);
router.get("/profile", authenticate, getUserProfile); 
router.post("/logout", authenticate, logoutUser);

export default router;
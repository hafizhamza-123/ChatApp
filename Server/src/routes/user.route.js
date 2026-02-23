import { Router } from "express";

import { registerUser, loginUser, getAllUsers, getUserProfile, updateProfile, logoutUser, refreshAccessToken, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refreshToken", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/all", authenticate, getAllUsers);
router.get("/profile", authenticate, getUserProfile); 
router.put("/profile", authenticate, upload.single("avatar"), updateProfile);
router.post("/logout", authenticate, logoutUser);

export default router;
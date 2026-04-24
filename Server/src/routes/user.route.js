import { Router } from "express";

import { registerUser, loginUser, getAllUsers, getUserProfile, updateProfile, logoutUser, refreshAccessToken, forgotPassword, resetPassword, verifyOtp, resendOtp } from "../controllers/user.controller.js";
import { authenticate } from "../Middlewares/authMiddleware.js";
import upload from "../Middlewares/upload.js";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/refreshToken", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/all", authenticate, getAllUsers);
router.get("/profile", authenticate, getUserProfile); 
router.put("/profile", authenticate, upload.single("avatar"), updateProfile);
router.post("/logout", authenticate, logoutUser);

export default router;

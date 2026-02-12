import { Router } from "express";

import userRoutes from "./user.route.js";
import messageRoutes from "./message.route.js";
import chatRoutes from "./chat.route.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/messages", messageRoutes);
router.use("/chats", chatRoutes);


export default router;
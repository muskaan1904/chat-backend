import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { getMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/get/:chatId", protect, getMessages);

export default router;
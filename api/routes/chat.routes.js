import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  createChat,
  getChats,
  addToGroup,
  removeFromGroup,
  renameGroup,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/create", protect, createChat);
router.get("/", protect, getChats);
router.put("/add-to-group", protect, addToGroup);
router.put("/remove-from-group", protect, removeFromGroup);
router.put("/rename-group", protect, renameGroup);

export default router;
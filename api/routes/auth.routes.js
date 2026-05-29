import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { signup, signin, logout, getUsers } from "../controllers/auth.controller.js";

const router = express.Router();

// public routes
router.post("/signup", signup);
router.post("/signin", signin);

// protected routes
router.post("/logout", protect, logout);
router.get("/users", protect, getUsers);

export default router;

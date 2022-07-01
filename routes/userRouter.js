import { signUp, signIn } from "../controllers/userController.js";
import { Router } from "express";

const router = Router();

// userController.js
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);

export default router;

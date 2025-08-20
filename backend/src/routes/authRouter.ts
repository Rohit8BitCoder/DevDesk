import { login, signUp } from "../controllers/authController.ts";
import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.ts";

const router = Router();

router.post("/login", asyncHandler(login));
router.post("/signup", asyncHandler(signUp));

export default router;

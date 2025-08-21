
import { login, signUp } from "../controllers/authController.ts";
import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.ts";
import validateRequest from "../middleware/validateRequest.ts";
import { signUpSchema, loginSchema } from "../validators/zodValidation.ts";

const router = Router();

router.post("/login", validateRequest(loginSchema), asyncHandler(login));
router.post("/signup", validateRequest(signUpSchema), asyncHandler(signUp));

export default router;

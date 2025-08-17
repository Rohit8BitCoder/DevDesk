
import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config();
const router = Router();

// Validate env variables early
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("❌ Missing SUPABASE_URL or SUPABASE_KEY in environment.");
}

// Create Supabase client for auth
const supabaseAuth: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Helper function for consistent error responses
const handleError = (res: Response, error: any, status = 400) => {
  console.error(error);
  return res.status(status).json({ success: false, error: error.message || error });
};

// ---------------- AUTH ROUTES ---------------- //

// Signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const { data, error } = await supabaseAuth.auth.signUp({ email, password });
    if (error) return handleError(res, error);

    return res.status(201).json({
      success: true,
      message: "Signup successful. Please confirm your email.",
      user: data.user,
    });
  } catch (error: any) {
    return handleError(res, error, 500);
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error) return handleError(res, error);

    return res.json({
      success: true,
      message: "Signin successful",
      session: data.session,
      user: data.user,
    });
  } catch (error: any) {
    return handleError(res, error, 500);
  }
});

export default router;


import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import { Router } from "express";
import authMiddleware from "../middleware.ts";

dotenv.config();
const router = Router();

// Validate env variables early
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("❌ Missing SUPABASE_URL or SUPABASE_KEY in environment.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// Helper for async routes
const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create profile (protected route)
router.post("/", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { username, full_name, avatar_url, role } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (!username) {
    return res.status(400).json({ success: false, error: "Username is required" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert([{ id: userId, username, full_name, avatar_url, role }])
    .select("id, username, full_name, avatar_url, role")
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.status(201).json({ success: true, data });
}));

// Fetch all profiles (public route)
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, role");

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
}));

// Fetch single profile (public route)
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, role")
    .eq("id", req.params.id)
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  if (!data) {
    return res.status(404).json({ success: false, error: "Profile not found" });
  }

  res.json({ success: true, data });
}));

// Update profile (protected route)
router.patch("/:id", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const profileId = req.params.id;
  const { username, full_name, avatar_url, role } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (userId !== profileId) {
    return res.status(403).json({ success: false, error: "Forbidden: Can only update your own profile" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ username, full_name, avatar_url, role })
    .eq("id", profileId)
    .select("id, username, full_name, avatar_url, role")
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  if (!data) {
    return res.status(404).json({ success: false, error: "Profile not found" });
  }

  res.json({ success: true, data });
}));

// Delete profile (protected route)
router.delete("/:id", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const profileId = req.params.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (userId !== profileId) {
    return res.status(403).json({ success: false, error: "Forbidden: Can only delete your own profile" });
  }

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, message: "Profile deleted successfully" });
}));

export default router;


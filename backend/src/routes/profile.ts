import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import { Router } from "express";

dotenv.config();
const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

// Helper for async routes
const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Create profile
router.post("/", asyncHandler(async (req: Request, res: Response) => {
  const { id, username, full_name, avatar_url, role } = req.body;

  if (!id || !username) {
    return res.status(400).json({ success: false, error: "id and username are required" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert([{ id, username, full_name, avatar_url, role }])
    .select("id, username, full_name, avatar_url, role")
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.status(201).json({ success: true, data });
}));

// Fetch all profiles
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, role");

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
}));

// Fetch single profile
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

export default router;


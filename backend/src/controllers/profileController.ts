import type { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse.ts";
import { supabase } from "../config/supabaseClient.ts";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.ts";



// Create profile (protected route)
export const CreateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { username, full_name, avatar_url, role } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, 401, false, { error: 'Unauthorized' });
  }

  if (!username) {
    return sendResponse(res, 400, false, { error: "Username is required" });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (existing) {
    return sendResponse(res, 409, false, { error: "Profile already exists" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert([{ id: userId, username, full_name, avatar_url, role }])
    .select("id, username, full_name, avatar_url, role")
    .single();

  if (error) {
    return sendResponse(res, 500, false, { error: error.message });
  }

  sendResponse(res, 201, true, { data: data });
};

// Fetch all profiles (public route)
export const getProfile = async (res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, role");

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
};

// Fetch single profile (public route)
export const getProfilebyId = async (req: Request, res: Response) => {
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
};

// Update profile (protected route)
export const updateProfie = async (req: AuthenticatedRequest, res: Response) => {
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
};

// Delete profile (protected route)
export const deleteProfile = async (req: AuthenticatedRequest, res: Response) => {
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
};


import type { Request, Response } from "express";
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import authMiddleware from "../middleware.ts";

dotenv.config();
const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("❌ Missing SUPABASE_URL or SUPABASE_KEY in environment.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const sendResponse = (
  res: Response,
  status: number,
  success: boolean,
  payload: any
) => res.status(status).json({ success, ...payload });

/**
 * CREATE ticket activity
 */
router.post("/tickets/:ticket_id/activity", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ticket_id } = req.params;
    const { action, details } = req.body;
    const userId = req.user?.id;

    if (!ticket_id) return sendResponse(res, 400, false, { error: "Invalid ticket id" });
    if (!action) return sendResponse(res, 400, false, { error: "Action is required" });

    const { data, error } = await supabase
      .from("ticket_activity")
      .insert([{ ticket_id, action, 'actor_id': userId, details }])
      .select()
      .single();

    if (error) return sendResponse(res, 500, false, { error: error.message });

    return sendResponse(res, 201, true, { activity: data });
  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
});

/**
 * GET all activities for a ticket
 */
router.get("/tickets/:ticket_id/activity", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ticket_id } = req.params;

    if (!ticket_id) return sendResponse(res, 400, false, { error: "Invalid ticket id" });

    const { data, error } = await supabase
      .from("ticket_activity")
      .select("*")
      .eq("ticket_id", ticket_id)
      .order("created_at", { ascending: true });

    if (error) return sendResponse(res, 500, false, { error: error.message });
    if (!data || data.length === 0) return sendResponse(res, 404, false, { message: "No activities found" });

    return sendResponse(res, 200, true, { activities: data });
  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
});

/**
 * GET all activities for a ticket by current user
 */
router.get("/tickets/:ticket_id/activity/user", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ticket_id } = req.params;
    const userId = req.user?.id;

    if (!ticket_id) return sendResponse(res, 400, false, { error: "Invalid ticket id" });

    const { data, error } = await supabase
      .from("ticket_activity")
      .select("*")
      .eq("ticket_id", ticket_id)
      .eq("actor_id", userId)
      .order("created_at", { ascending: true });

    if (error) return sendResponse(res, 500, false, { error: error.message });
    if (!data || data.length === 0) return sendResponse(res, 404, false, { message: "No activities found for this user" });

    return sendResponse(res, 200, true, { activities: data });
  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
});

/**
 * DELETE activity (only allowed for creator)
 */
router.delete("/tickets/:ticket_id/activity/:activity_id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ticket_id, activity_id } = req.params;
    const userId = req.user?.id;

    if (!ticket_id) return sendResponse(res, 400, false, { error: "Invalid ticket id" });
    if (!activity_id) return sendResponse(res, 400, false, { error: "Invalid activity id" });

    const { data, error } = await supabase
      .from("ticket_activity")
      .delete()
      .eq("id", activity_id)
      .eq("ticket_id", ticket_id)
      .eq("actor_id", userId)
      .select()
      .single();

    if (error) return sendResponse(res, 500, false, { error: error.message });
    if (!data) return sendResponse(res, 404, false, { message: "Activity not found or not allowed" });

    return sendResponse(res, 200, true, { deleted: data });
  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
});

export default router;

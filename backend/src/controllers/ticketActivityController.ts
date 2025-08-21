import { sendResponse } from "../utils/sendResponse.ts";
import { supabase } from "../config/supabaseClient.ts";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.ts";
/**
 * CREATE ticket activity */

export const createactivity = async (req: AuthenticatedRequest, res: Response) => {

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
};

/**
 * GET all activities for a ticket
 */
export const getActivitiesbytId = async (req: AuthenticatedRequest, res: Response) => {
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
};

/**
 * GET all activities for a ticket by current user
 */
export const getAllActivitiesByuser = async (req: AuthenticatedRequest, res: Response) => {
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
};

/**
 * DELETE activity (only allowed for creator)
 */
export const DelActivitybyId = async (req: AuthenticatedRequest, res: Response) => {
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
};

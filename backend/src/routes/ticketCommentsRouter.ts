import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import authMiddleware from "../middleware/Authmiddleware.ts";

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



router.post('/tickets/:ticket_id/comments', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content } = req.body;
    const ticket_id = req.params.ticket_id;
    const userId = req.user?.id;

    if (!ticket_id) return sendResponse(res, 400, false, { error: "Invalid ticket id" });
    if (!content) return sendResponse(res, 400, false, { error: "Comment is required" });

    const { data, error } = await supabase
      .from('ticket_comments')
      .insert([{ ticket_id, author_id: userId, content }])
      .select()
      .single();

    if (error) return sendResponse(res, 500, false, { error: error.message });
    return sendResponse(res, 201, true, { comment: data });
  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
});

// GET all comments for ticket
router.get('/tickets/:ticket_id/comments', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket_id = req.params.ticket_id;
    if (!ticket_id) return sendResponse(res, 400, false, { error: "Invalid ticket id" });

    const { data, error } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', ticket_id)
      .order('created_at', { ascending: true });

    if (error) return sendResponse(res, 500, false, { error: error.message });
    if (!data || data.length === 0) return sendResponse(res, 404, false, { message: "No comments found" });

    return sendResponse(res, 200, true, { comments: data });
  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
});

// GET all comments for a ticket by current user
router.get('/tickets/:ticket_id/comments/user', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket_id = req.params.ticket_id;
    const userId = req.user?.id;

    if (!ticket_id) return sendResponse(res, 400, false, { error: "Invalid ticket id" });

    const { data, error } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', ticket_id)
      .eq('author_id', userId);

    if (error) return sendResponse(res, 500, false, { error: error.message });
    if (!data || data.length === 0) return sendResponse(res, 404, false, { message: "No comments found for this user" });

    return sendResponse(res, 200, true, { comments: data });
  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
});

// DELETE a comment
router.delete('/tickets/:ticket_id/comments/:comment_id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { ticket_id, comment_id } = req.params;

    if (!ticket_id) return sendResponse(res, 400, false, { error: "Invalid ticket id" });
    if (!comment_id) return sendResponse(res, 400, false, { error: "Invalid comment id" });

    const { data, error } = await supabase
      .from('ticket_comments')
      .delete()
      .eq('id', comment_id)
      .eq('ticket_id', ticket_id)
      .eq('author_id', userId)
      .select()
      .single();

    if (error) return sendResponse(res, 500, false, { error: error.message });
    if (!data) return sendResponse(res, 404, false, { message: "Comment not found or not allowed" });

    return sendResponse(res, 200, true, { deleted: data });
  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
});


export default router;


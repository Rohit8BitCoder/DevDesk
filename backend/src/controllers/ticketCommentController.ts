import { sendResponse } from "../utils/sendResponse.ts";
import { supabase } from "../config/supabaseClient.ts";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.ts";


export const createComment = async (req: AuthenticatedRequest, res: Response) => {

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
};

// GET all comments for ticket
export const getcommentbyticketId = async (req: AuthenticatedRequest, res: Response) => {

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
};

// GET all comments for a ticket by current user
export const getallCommentbyUserId = async (req: AuthenticatedRequest, res: Response) => {

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
};

// DELETE a comment
export const DeleteCommentbyId = async (req: AuthenticatedRequest, res: Response) => {
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
};

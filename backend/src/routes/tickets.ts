import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import authMiddleware from "../middleware.ts";

dotenv.config();
const router = Router();

// Validate env variables early
const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("❌ Missing SUPABASE_URL or SUPABASE_KEY in environment.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// -----------------------------
// Types
// -----------------------------
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "critical";

interface TicketCreateBody {
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
}

interface TicketUpdateBody {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
}

const STATUS: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
const PRIORITY: TicketPriority[] = ["low", "medium", "high", "critical"];

// -----------------------------
// Response helper
// -----------------------------
const sendResponse = (
  res: Response,
  status: number,
  success: boolean,
  payload: any
) => res.status(status).json({ success, ...payload });

// -----------------------------
// Validation Middleware
// -----------------------------
const validateTicketData = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, status = "open", priority = "medium" } = req.body as TicketCreateBody;

  if (!title || !description) {
    return sendResponse(res, 400, false, { error: "Title and description are required" });
  }

  if (!STATUS.includes(status)) {
    return sendResponse(res, 400, false, { error: `Invalid status. Allowed: ${STATUS.join(", ")}` });
  }

  if (!PRIORITY.includes(priority)) {
    return sendResponse(res, 400, false, { error: `Invalid priority. Allowed: ${PRIORITY.join(", ")}` });
  }

  next();
};

const validateTicketUpdate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, status, priority, assigned_to } = req.body as TicketUpdateBody;

  if (title === undefined && description === undefined && status === undefined && priority === undefined && assigned_to === undefined) {
    return sendResponse(res, 400, false, { error: "At least one field must be provided to update" });
  }

  if (status !== undefined && !STATUS.includes(status)) {
    return sendResponse(res, 400, false, { error: `Invalid status. Allowed: ${STATUS.join(", ")}` });
  }

  if (priority !== undefined && !PRIORITY.includes(priority)) {
    return sendResponse(res, 400, false, { error: `Invalid priority. Allowed: ${PRIORITY.join(", ")}` });
  }

  next();
};


// Create ticket: 
router.post(
  "/projects/:project_id/tickets",
  authMiddleware,
  validateTicketData,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const project_id = req.params.project_id;
      const userId = req.user?.id;
      const { title, description, status = "open", priority = "medium", assigned_to } = req.body as TicketCreateBody;

      if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

      // Check if project exists
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", project_id)
        .eq("owner_id", userId)
        .single();

      if (!project) return sendResponse(res, 404, false, { error: "Project not found" });

      // Insert ticket
      const { data, error } = await supabase
        .from("tickets")
        .insert([{ project_id, title, description, status, priority, created_by: userId, assigned_to }])
        .select("*")
        .single();

      if (error) return sendResponse(res, 500, false, { error: error.message });
      return sendResponse(res, 201, true, { ticket: data });
    } catch (err: any) {
      return sendResponse(res, 500, false, { error: err.message });
    }
  }
);

// Fetch all tickets for a project
router.get(
  "/projects/:project_id/tickets",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const project_id = req.params.project_id;
      const userId = req.user?.id;

      if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

      // Ensure project belongs to the user
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", project_id)
        .eq("owner_id", userId)
        .single();

      if (!project) return sendResponse(res, 404, false, { error: "Project not found" });

      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("project_id", project_id);

      if (error) return sendResponse(res, 500, false, { error: error.message });

      return sendResponse(res, 200, true, { tickets: data || [] });
    } catch (err: any) {
      return sendResponse(res, 500, false, { error: err.message });
    }
  }
);

// Fetch single ticket
router.get(
  "/tickets/:ticket_id",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ticket_id = req.params.ticket_id;
      const userId = req.user?.id;

      if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

      const { data: ticket, error } = await supabase
        .from("tickets")
        .select("id, project_id, title, description, status, priority, assigned_to, created_by, created_at, updated_at")
        .eq("id", ticket_id)
        .single();

      if (error) return sendResponse(res, 500, false, { error: error.message });
      if (!ticket) return sendResponse(res, 404, false, { message: "Ticket not found" });

      // Authorize based on project ownership
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", ticket.project_id)
        .eq("owner_id", userId)
        .single();

      if (!project) return sendResponse(res, 403, false, { error: "Forbidden" });

      return sendResponse(res, 200, true, { ticket });

    } catch (err: any) {
      return sendResponse(res, 500, false, { error: err.message });
    }
  }
);

//update ticket
router.patch('/tickets/:ticket_id',
  authMiddleware,
  validateTicketUpdate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, description, status, priority, assigned_to } = req.body as TicketUpdateBody;
      const ticket_id = req.params.ticket_id;
      const userId = req.user?.id;

      if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

      // Fetch ticket
      const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select('id, project_id')
        .eq('id', ticket_id)
        .single();

      if (fetchError) return sendResponse(res, 500, false, { error: fetchError.message });
      if (!ticket) return sendResponse(res, 404, false, { message: 'Ticket not found' });

      // Authorize based on project ownership
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', ticket.project_id)
        .eq('owner_id', userId)
        .single();

      if (!project) return sendResponse(res, 403, false, { error: 'Forbidden' });

      const updateData: Record<string, any> = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (assigned_to !== undefined) updateData.assigned_to = assigned_to;

      const { data, error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticket_id)
        .select('*')
        .single();

      if (error) return sendResponse(res, 500, false, { error: error.message });
      if (!data) return sendResponse(res, 404, false, { message: 'Ticket not found for update' });
      return sendResponse(res, 200, true, { ticket: data });

    } catch (error: any) {
      return sendResponse(res, 500, false, { error: error.message });

    }
  })


//delete a ticket

router.delete('/tickets/:ticket_id',
  authMiddleware
  , async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ticket_id = req.params.ticket_id;
      const userId = req.user?.id

      if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });


      const { data, error } = await supabase
        .from('tickets')
        .delete()
        .eq('ticket_id', ticket_id)
        .eq('created_by', userId)
        .select()
        .single()
      if (error) return sendResponse(res, 500, false, { error: error.message });
      if (!data) return sendResponse(res, 404, false, { message: 'Ticket not found for deletion' });
      return sendResponse(res, 200, true, { ticket: data });

    } catch (error: any) {
      return sendResponse(res, 500, false, { error: error.message })
    }

  })

export default router;


import { Router, Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import authMiddleware from "../middleware.ts";

dotenv.config();
const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

// -----------------------------
// Types
// -----------------------------
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "critical";

interface TicketBody {
  title: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string;
}

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
  const { title, description, status = "open", priority = "medium" } = req.body as TicketBody;

  if (!title || !description) {
    return sendResponse(res, 400, false, { error: "Title and description are required" });
  }

  const STATUS: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
  const PRIORITY: TicketPriority[] = ["low", "medium", "high", "critical"];

  if (!STATUS.includes(status)) {
    return sendResponse(res, 400, false, { error: `Invalid status. Allowed: ${STATUS.join(", ")}` });
  }

  if (!PRIORITY.includes(priority)) {
    return sendResponse(res, 400, false, { error: `Invalid priority. Allowed: ${PRIORITY.join(", ")}` });
  }

  next();
};

// -----------------------------
// Routes
// -----------------------------

// Create ticket: 
router.post(
  "/projects/:project_id/tickets",
  authMiddleware,
  validateTicketData,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const project_id = req.params.project_id;
      const created_by = req.user?.id;
      const { title, description, status = "open", priority = "medium", assigned_to } = req.body as TicketBody;

      // Check if project exists
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", project_id)
        .single();

      if (!project) return sendResponse(res, 404, false, { error: "Project not found" });

      // Insert ticket
      const { data, error } = await supabase
        .from("tickets")
        .insert([{ project_id, title, description, status, priority, created_by, assigned_to }])
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

      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("project_id", project_id);

      if (error) return sendResponse(res, 500, false, { error: error.message });
      if (!data || data.length === 0)
        return sendResponse(res, 404, false, { message: "No tickets found for this project" });

      return sendResponse(res, 200, true, { tickets: data });
    } catch (err: any) {
      return sendResponse(res, 500, false, { error: err.message });
    }
  }
);

// Fetch single ticket: 
router.get(
  "/tickets/:ticket_id",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ticket_id = req.params.ticket_id;

      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticket_id)
        .single();

      if (error) return sendResponse(res, 500, false, { error: error.message });
      if (!data) return sendResponse(res, 404, false, { message: "Ticket not found" });

      return sendResponse(res, 200, true, { ticket: data });
    } catch (err: any) {
      return sendResponse(res, 500, false, { error: err.message });
    }
  }
);

export default router;


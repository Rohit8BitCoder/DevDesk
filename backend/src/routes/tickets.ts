import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv"
import { Router } from "express";
import type { Request, Response } from "express";
import authMiddleware from "../middleware.ts"

dotenv.config();

const router = Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const sendResponse = (res: Response, status: number, success: boolean, payload: any) => {
  res.status(status).json({ success, ...payload });

};

//enums for validation

const STATUS = ['open', 'in_progress', 'resolved', 'closed'] as const;
const PRIORITY = ['low', 'medium', 'high', 'critical'] as const;

//create tickets 

router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {

    const project_id = req.params.id;
    const created_by = req.user?.id;
    const { title, description, status = 'open', priority = 'medium', assigned_to } = req.body;

    if (!title || !description) return res.status(400).json({ error: "Title and description are required" });

    if (!STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${STATUS.join(", ")}` });
    }

    if (!PRIORITY.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Allowed: ${PRIORITY.join(", ")}` });
    }

    //check project
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
    if (!project) return res.status(404).json({ error: 'project not found' });


    //insert data in tickets table
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        project_id: project_id,
        title,
        description,
        status,
        priority,
        created_by: created_by,
        assigned_to
      }])
      .select("*")
      .single()

    if (error) return sendResponse(res, 500, false, { error: error.message });
    return sendResponse(res, 200, true, { tickets: data })
  } catch (err: any) {
    return sendResponse(res, 500, false, { error: err.message });
  }
})

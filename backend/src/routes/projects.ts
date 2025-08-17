
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv";
import { Router } from "express"
import type { Request, Response } from "express";
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

// Utility for consistent responses
const sendResponse = (res: Response, status: number, success: boolean, payload: any) => {
  res.status(status).json({ success, ...payload });
};

// List all projects for a user
router.get("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, created_at")
      .eq("owner_id", userId);

    if (error) return sendResponse(res, 500, false, { error: error.message });
    if (!data || data.length === 0) return sendResponse(res, 404, false, { error: "No projects found" });

    return sendResponse(res, 200, true, { projects: data });
  } catch (err: any) {
    return sendResponse(res, 500, false, { error: err.message });
  }
});

// Fetch project details
router.get("/:id", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const projectId = req.params.id;
    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", userId)
      .eq("id", projectId)
      .single();

    if (error) return sendResponse(res, 500, false, { error: error.message });
    if (!data) return sendResponse(res, 404, false, { error: "Project not found" });

    return sendResponse(res, 200, true, { project: data });
  } catch (err: any) {
    return sendResponse(res, 500, false, { error: err.message });
  }
});

// Create new project
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description } = req.body;
    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
    if (!name) return sendResponse(res, 400, false, { error: "Project name is required" });

    const { data, error } = await supabase
      .from("projects")
      .insert([{ name, description, owner_id: userId }])
      .select()
      .single()

    if (error) return sendResponse(res, 500, false, { error: error.message });

    return sendResponse(res, 201, true, { project: data });
  } catch (err: any) {
    return sendResponse(res, 500, false, { error: err.message });
  }
});


//update a project details

router.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {

    const userId = req.user?.id;
    const project_id = req.params.id;
    const { name, description } = req.body;
    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" })
    if (!name) return sendResponse(res, 400, false, { error: 'project name is required' });

    const { data, error } = await supabase
      .from('projects')
      .update({ name, description })
      .eq("id", project_id)
      .eq("owner_id", userId)
      .select()
      .single()

    if (error) return sendResponse(res, 500, false, { error: error.message });
    return sendResponse(res, 200, true, { project: data });

  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
})

// Delete project
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const projectId = req.params.id;
    
    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq("id", projectId)
      .eq("owner_id", userId);

    if (error) return sendResponse(res, 500, false, { error: error.message });
    
    return sendResponse(res, 200, true, { message: "Project deleted successfully" });
  } catch (error: any) {
    return sendResponse(res, 500, false, { error: error.message });
  }
});

export default router;

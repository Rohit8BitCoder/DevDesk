import { sendResponse } from "../utils/sendResponse.ts";
import { supabase } from "../config/supabaseClient.ts";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.ts";
import type { Response } from "express";


// List all projects for a user
export const getprojectbyUser = async (req: AuthenticatedRequest, res: Response) => {

  const userId = req.user?.id;
  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, created_at")
    .eq("owner_id", userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });
  if (!data || data.length === 0) return sendResponse(res, 404, false, { error: "No projects found" });

  return sendResponse(res, 200, true, { projects: data });
};

// Fetch project details
export const getProjectsbyId = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.P_id;
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
}

// Create new project
export const creatProject = async (req: AuthenticatedRequest, res: Response) => {
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

};


//update a project details

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const project_id = req.params.P_id;
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
};

// Delete project
export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const projectId = req.params.P_id;

  if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq("id", projectId)
    .eq("owner_id", userId);

  if (error) return sendResponse(res, 500, false, { error: error.message });

  return sendResponse(res, 200, true, { message: "Project deleted successfully" });
};


import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.ts";
import { sendResponse } from "../utils/sendResponse.ts";
import type { TicketCreateBody, TicketUpdateBody } from "../types/ticketTypes.ts";
import { TicketService } from "../services/ticketService.ts";

export const TicketController = {
  create: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const project_id = req.params.project_id;
    const { title, description, status = "open", priority = "medium", assigned_to } = req.body as TicketCreateBody;

    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
    if (!project_id) return sendResponse(res, 400, false, { error: "Project ID is required" });

    const { data: project } = await TicketService.getProjectById(project_id, userId);
    if (!project) return sendResponse(res, 404, false, { error: "Project not found" });

    const { data, error } = await TicketService.createTicket({
      project_id,
      title,
      description,
      status,
      priority,
      created_by: userId,
      assigned_to,
    });

    if (error) return sendResponse(res, 500, false, { error: error.message });
    return sendResponse(res, 201, true, { ticket: data });
  },

  getAll: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const project_id = req.params.project_id;

    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
    if (!project_id) return sendResponse(res, 400, false, { error: "Project ID is required" });

    const { data: project } = await TicketService.getProjectById(project_id, userId);
    if (!project) return sendResponse(res, 404, false, { error: "Project not found" });

    const { data, error } = await TicketService.getTicketsByProject(project_id);
    if (error) return sendResponse(res, 500, false, { error: error.message });
    return sendResponse(res, 200, true, { tickets: data || [] });
  },

  getOne: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const ticket_id = req.params.ticket_id;

    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
    if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });

    const { data: ticket, error } = await TicketService.getTicketById(ticket_id);
    if (error) return sendResponse(res, 500, false, { error: error.message });
    if (!ticket) return sendResponse(res, 404, false, { error: "Ticket not found" });

    const { data: project } = await TicketService.getProjectById(ticket.project_id, userId);
    if (!project) return sendResponse(res, 403, false, { error: "Forbidden" });

    return sendResponse(res, 200, true, { ticket });
  },

  update: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const ticket_id = req.params.ticket_id;
    const { title, description, status, priority, assigned_to } = req.body as TicketUpdateBody;

    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
    if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });

    const { data: ticket } = await TicketService.getTicketById(ticket_id);
    if (!ticket) return sendResponse(res, 404, false, { error: "Ticket not found" });

    const { data: project } = await TicketService.getProjectById(ticket.project_id, userId);
    if (!project) return sendResponse(res, 403, false, { error: "Forbidden" });

    const updateData: any = { title, description, status, priority, assigned_to };
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    const { data, error } = await TicketService.updateTicket(ticket_id, updateData);
    if (error) return sendResponse(res, 500, false, { error: error.message });

    return sendResponse(res, 200, true, { ticket: data });
  },

  remove: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const ticket_id = req.params.ticket_id;

    if (!userId) return sendResponse(res, 401, false, { error: "Unauthorized" });
    if (!ticket_id) return sendResponse(res, 400, false, { error: "Ticket ID is required" });

    const { data: ticket } = await TicketService.getTicketById(ticket_id);
    if (!ticket) return sendResponse(res, 404, false, { error: "Ticket not found" });

    const { data: project } = await TicketService.getProjectById(ticket.project_id, userId);
    if (!project && ticket.created_by !== userId) {
      return sendResponse(res, 403, false, { error: "Forbidden" });
    }

    const { data, error } = await TicketService.deleteTicket(ticket_id);
    if (error) return sendResponse(res, 500, false, { error: error.message });

    return sendResponse(res, 200, true, { deleted: data });
  },
};



import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/AuthenticatedRequest.ts";
import { sendResponse } from "../utils/sendResponse.ts";
import { STATUS, PRIORITY } from "../types/ticketTypes.ts";
import type { TicketCreateBody, TicketUpdateBody } from "../types/ticketTypes.ts";

export const validateTicketData = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

export const validateTicketUpdate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, status, priority, assigned_to } = req.body as TicketUpdateBody;

  if (!title && !description && !status && !priority && !assigned_to) {
    return sendResponse(res, 400, false, { error: "At least one field must be provided to update" });
  }
  if (status && !STATUS.includes(status)) {
    return sendResponse(res, 400, false, { error: `Invalid status. Allowed: ${STATUS.join(", ")}` });
  }
  if (priority && !PRIORITY.includes(priority)) {
    return sendResponse(res, 400, false, { error: `Invalid priority. Allowed: ${PRIORITY.join(", ")}` });
  }
  next();
};

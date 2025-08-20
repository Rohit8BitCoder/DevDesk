import { Response } from "express";

// Utility for consistent responses
export const sendResponse = (res: Response, status: number, success: boolean, payload: any) => {
  res.status(status).json({ success, ...payload });
};



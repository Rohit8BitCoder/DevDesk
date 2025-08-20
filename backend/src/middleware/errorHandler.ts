import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/sendResponse.ts";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);
  sendResponse(res, 500, false, { error: err.message });
};

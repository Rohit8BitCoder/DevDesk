import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { sendResponse } from "../utils/sendResponse.ts";

const validateRequest = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return sendResponse(res, 400, false, { error: result.error })
  }
  next();
};

export default validateRequest;

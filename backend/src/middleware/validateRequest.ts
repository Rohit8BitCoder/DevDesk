import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

const validateRequest = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.issues.map((e: any) => e.message),
    });
  }
  next();
};

export default validateRequest;

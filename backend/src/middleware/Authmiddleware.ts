import { createClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

const middleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Missing authorization token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token"
      });
    }
    
    (req as any).user = user;
    next();
  } catch (error: any) {
    console.error('Middleware error:', error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed"
    });
  }
};

export default middleware;

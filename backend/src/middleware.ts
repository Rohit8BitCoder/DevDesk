import { createClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

const middleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.json({ error: 'missing token' })
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.json({
      error: "invalid user"
    })
  }
  (req as any).user = user;
  next()
};

export default middleware;

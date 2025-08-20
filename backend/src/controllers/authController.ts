import type { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse.ts";
import { supabaseAuth } from "../config/supabaseClient.ts";


const signUp = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const { data, error } = await supabaseAuth.auth.signUp({ email, password });

    if (error) return sendResponse(res, 400, false, { error: error.message });

    return res.status(201).json({
      success: true,
      message: "Signup successful. Please confirm your email.",
      user: data.user,
    });
};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (error) return sendResponse(res, 500, false, { error: error.message });

    return res.json({
      success: true,
      message: "Signin successful",
      session: data.session,
      user: data.user,
    });
};



export { signUp, login }

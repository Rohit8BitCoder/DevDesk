import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("❌ Missing SUPABASE_URL or SUPABASE_KEY in environment.");
}

// Create Supabase client for auth
const supabaseAuth: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export { supabaseAuth, supabase };


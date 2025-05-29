import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
supabase
  .from("messages")
  .select("count")
  .then(({ data, error }) => {
    if (error) {
      console.error("Supabase connection error:", error);
    } else {
      console.log("Supabase connected successfully");
    }
  });

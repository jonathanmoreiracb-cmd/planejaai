import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured =
  supabaseUrl &&
  supabaseUrl.startsWith("http") &&
  supabaseUrl !== "xxx" &&
  supabaseUrl !== "undefined" &&
  supabaseUrl !== "null" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "xxx" &&
  supabaseAnonKey !== "undefined" &&
  supabaseAnonKey !== "null";

export const createClient = () => {
  return createBrowserClient(
    isConfigured ? supabaseUrl : "https://placeholder-url.supabase.co",
    isConfigured
      ? supabaseAnonKey
      : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
  );
};

export const supabase = createClient();

export const getSupabaseConfig = () => ({
  isConfigured,
  supabaseUrl,
});

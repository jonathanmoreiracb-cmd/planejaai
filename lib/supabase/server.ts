import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured =
  supabaseUrl &&
  supabaseUrl !== "xxx" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "xxx";

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    isConfigured ? supabaseUrl : "https://placeholder-url.supabase.co",
    isConfigured
      ? supabaseAnonKey
      : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Component cookie set error is safely ignored
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Server Component cookie remove error is safely ignored
          }
        },
      },
    }
  );
};

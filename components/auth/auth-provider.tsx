"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase, getSupabaseConfig } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const config = getSupabaseConfig();
    const useMockDemo =
      typeof window !== "undefined" &&
      (localStorage.getItem("use_mock_demo") === "true" ||
        document.cookie.includes("use_mock_demo=true"));

    if (!config.isConfigured || useMockDemo) {
      // Offline/Mock mode activated! Let's mock a user session so they can test the UI!
      const mockUser = {
        id: "mock-user-id-teacher",
        email: "professora.teste@planejaai.com",
        user_metadata: {
          full_name: "Profª. Mariana Souza (Demonstração)",
          profile_type: "teacher",
        },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as any;

      const mockSession = {
        access_token: "mock-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-refresh",
        user: mockUser,
      } as any;

      setSession(mockSession);
      setUser(mockUser);
      setIsLoading(false);
      return;
    }

    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    const getInitialSession = async () => {
      try {
        // 1.2s timeout to prevent client-side block if Supabase is offline/paused
        const sessionPromise = supabase.auth
          .getSession()
          .then(({ data }) => data.session);
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 1200)
        );
        const session = await Promise.race([sessionPromise, timeoutPromise]);
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Erro ao carregar sessão inicial:", err);
      } finally {
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      getInitialSession();

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      });
      subscription = data.subscription;
    } catch (err) {
      console.error("Erro ao assinar mudanças de autenticação:", err);
      setIsLoading(false);
      clearTimeout(safetyTimeout);
    }

    return () => {
      clearTimeout(safetyTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("use_mock_demo");
        document.cookie =
          "use_mock_demo=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      }
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Erro ao encerrar sessão:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error("Erro ao autenticar com o Google:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, user, isLoading, signOut, signInWithGoogle }}
    >
      {isLoading ? (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">
              Carregando ambiente seguro...
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}

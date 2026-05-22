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
    if (!config.isConfigured) {
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

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Erro ao carregar sessão inicial:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
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

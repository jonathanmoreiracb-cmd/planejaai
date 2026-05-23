"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  LayoutDashboard,
  Settings,
  FileText,
  LogOut,
  User,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { planTier } = useSubscription();
  const [userEmail, setUserEmail] = useState<string>("Professor(a)");

  useEffect(() => {
    async function loadUser() {
      const { getSupabaseConfig } = await import("@/lib/supabase/client");
      const config = getSupabaseConfig();
      const useMockDemo =
        typeof window !== "undefined" &&
        (localStorage.getItem("use_mock_demo") === "true" ||
          document.cookie.includes("use_mock_demo=true"));

      if (!config.isConfigured || useMockDemo) {
        setUserEmail("professora.teste@planejaai.com");
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || "Professor(a)");
        }
      }
    }
    loadUser();
  }, []);

  const primaryNavigation = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/planner", label: "Novo Plano", icon: Sparkles },
    { href: "/pricing", label: "Preços", icon: CreditCard },
  ];

  const secondaryNavigation = [
    { href: "/billing", label: "Faturamento", icon: CreditCard },
    { href: "/setup", label: "Perfil Escola", icon: Settings },
  ];

  const initials = userEmail.split("@")[0].slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("use_mock_demo");
      document.cookie =
        "use_mock_demo=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/login";
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card text-card-foreground shrink-0 h-[calc(100vh-4rem)] p-4 justify-between sticky top-16">
      <div className="flex flex-col gap-6">
        {/* Navigation Group 1 */}
        <div className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/75 mb-2">
            Navegação Principal
          </p>
          {primaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    isActive
                      ? "text-white"
                      : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                {item.label}
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Saved Plans or Quick Actions */}
        <div className="flex flex-col gap-1 mt-2">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/75 mb-2">
            Recursos Rápidos
          </p>
          <div className="flex flex-col gap-1">
            <Link
              href="/planner"
              className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Gerador de Aula IA</span>
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Upgrade de Conta</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer / Account Actions */}
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <div className="flex flex-col gap-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-muted hover:text-foreground",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-red-500/5 hover:text-red-500 w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair do App</span>
          </button>
        </div>

        {/* User Card with Subscription Badge */}
        <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-2xl border border-border/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-black text-xs shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold truncate text-foreground leading-snug">
                {userEmail.split("@")[0]}
              </span>
              <span className="text-[9px] text-muted-foreground truncate leading-normal">
                {userEmail}
              </span>
            </div>
          </div>

          {planTier && planTier !== "free" && (
            <Badge className="bg-primary hover:bg-primary/95 text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded-md shrink-0 ml-1.5">
              {planTier}
            </Badge>
          )}
        </div>
      </div>
    </aside>
  );
}

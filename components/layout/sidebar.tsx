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
  CreditCard,
  Shield,
  Layers,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { planTier } = useSubscription();
  const [userEmail, setUserEmail] = useState<string>("Professor(a)");
  const [isAdmin, setIsAdmin] = useState(false);

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
        setIsAdmin(true);
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const email = user.email || "Professor(a)";
          setUserEmail(email);
          if (
            email.includes("admin") ||
            email.includes(".teste") ||
            email.includes("jonathan")
          ) {
            setIsAdmin(true);
          }
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
    <aside className="hidden md:flex flex-col w-[260px] border-r border-slate-100 dark:border-slate-800 bg-[#FAFCFF] dark:bg-slate-950 text-slate-700 dark:text-slate-300 shrink-0 h-[calc(100vh-4rem)] p-4 justify-between sticky top-16 transition-all duration-300">
      <div className="flex flex-col gap-6">
        {/* Premium Notion-style Workspace Switcher */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-sky-500/10 shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate leading-snug">
                Sala de Aula 1
              </span>
              <span className="text-[9px] text-slate-400 font-semibold truncate leading-none">
                PlanejaAI Pedagógico
              </span>
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-1" />
        </div>

        {/* Navigation Group 1 */}
        <div className="flex flex-col gap-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/10 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-105",
                    isActive
                      ? "text-white animate-pulse"
                      : "text-slate-400 group-hover:text-sky-600"
                  )}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Saved Plans or Quick Actions */}
        <div className="flex flex-col gap-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
            Atalhos
          </p>
          <div className="flex flex-col gap-0.5">
            <Link
              href="/planner"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100/40 dark:hover:bg-slate-900/40 hover:text-sky-600 dark:hover:text-sky-400 transition-all duration-200 hover:translate-x-1"
            >
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium">Assistente de Aula</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer / Account Actions */}
      <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-900 pt-4">
        <div className="flex flex-col gap-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200",
                  isActive ? "text-sky-600 font-bold" : "text-slate-500"
                )}
              >
                <Icon className="h-4 w-4 text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-500 hover:translate-x-1",
                pathname === "/admin" &&
                  "bg-amber-500/10 text-amber-500 hover:bg-amber-500/15"
              )}
            >
              <Shield className="h-4 w-4 text-amber-500" />
              <span>Painel Admin</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 text-slate-500 hover:bg-rose-500/5 hover:text-rose-500 w-full text-left"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            <span>Sair do App</span>
          </button>
        </div>

        {/* User Card with Subscription Badge */}
        <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 truncate leading-snug">
                {userEmail.split("@")[0]}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate leading-normal font-medium">
                {userEmail}
              </span>
            </div>
          </div>

          {planTier && planTier !== "free" && (
            <Badge className="bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded-md shrink-0 ml-1.5 select-none border-none">
              {planTier === "pro" ? "PRO" : "ESCOLA"}
            </Badge>
          )}
        </div>
      </div>
    </aside>
  );
}

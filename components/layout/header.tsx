"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  CalendarRange,
  CreditCard,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/planner", label: "Novo Plano", icon: Sparkles, badge: "AI" },
    { href: "/pricing", label: "Planos & Preços", icon: CalendarRange },
    { href: "/setup", label: "Configurar Perfil", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand/Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground transition-all duration-300 hover:opacity-90"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold">
            PlanejaAI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:text-primary ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1.5 py-0 text-[10px] bg-secondary text-white border-none font-bold"
                  >
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <span className="absolute -bottom-5 left-0 w-full h-[2px] bg-primary rounded-full animate-in fade-in zoom-in-50 duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section Actions */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Entrar
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/95 text-white font-semibold transition-all duration-300 hover:shadow-md hover:shadow-primary/10"
            >
              Começar Grátis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface UpgradeButtonProps {
  priceId: string;
  planTier: "pro" | "escola";
  className?: string;
  variant?: "default" | "outline" | "secondary";
  children?: React.ReactNode;
}

export function UpgradeButton({
  priceId,
  planTier,
  className = "",
  variant = "default",
  children,
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Redireciona para o login se não logado, passando o pricing como redirect
        router.push("/login?redirect=/pricing");
        return;
      }

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planTier }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Ocorreu um erro ao preparar o checkout."
        );
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout nao retornada.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = planTier === "pro";

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isLoading}
      variant={variant}
      className={`w-full font-bold h-11 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
        variant === "default"
          ? isPro
            ? "bg-primary hover:bg-primary/95 text-white shadow-primary/10"
            : "bg-secondary hover:bg-secondary/95 text-white shadow-secondary/10"
          : ""
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4.5 w-4.5 animate-spin" />
      ) : (
        <Sparkles className="h-4.5 w-4.5" />
      )}
      <span>
        {children || `Assinar Plano ${planTier === "pro" ? "Pro" : "Escola"}`}
      </span>
    </Button>
  );
}

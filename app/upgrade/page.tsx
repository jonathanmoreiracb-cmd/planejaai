"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";

export default function UpgradePage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const triggerFastUpgrade = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login?redirect=/upgrade");
          return;
        }

        const pricePro =
          process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_1ProMonthly";

        const response = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId: pricePro, planTier: "pro" }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Erro ao preparar checkout.");
        }

        if (data.url) {
          window.location.href = data.url;
        }
      } catch (err: any) {
        console.error(err);
        setError(
          err.message ||
            "Houve uma falha de comunicacao. Redirecionando para planos..."
        );
        setTimeout(() => {
          router.push("/pricing");
        }, 3000);
      }
    };

    triggerFastUpgrade();
  }, [router]);

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Container Workspace */}
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="border-border bg-card shadow-2xl p-10 max-w-sm w-full rounded-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary animate-pulse" />

          <CardContent className="p-0 space-y-6">
            <div className="relative flex items-center justify-center mx-auto mb-4">
              <div className="absolute h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
            </div>

            {error ? (
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-red-500 tracking-tight">
                  {error}
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Aguarde, redirecionando para a tabela comparativa...
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                  Preparando seu Acesso Pro
                </h3>
                <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                  Estamos estabelecendo uma sessao segura de checkout via
                  Stripe. Voce sera redirecionado em instantes.
                </p>
              </div>
            )}

            <hr className="border-border/60" />

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Conexao Criptografada e Segura</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

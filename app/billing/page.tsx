"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

export default function BillingPage() {
  const { subscription, planTier, isFree, isLoading } = useSubscription();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleManageBilling = async () => {
    setIsRedirecting(true);
    try {
      const response = await fetch("/api/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Erro ao preparar o portal de faturamento."
        );
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Falha ao redirecionar para a Stripe.");
    } finally {
      setIsRedirecting(false);
    }
  };

  const nextBillingDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Sidebar panel */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-grow p-4 sm:p-8 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500 pb-16">
        {/* Title */}
        <div className="space-y-1.5 border-b border-border/40 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <span>Faturamento & Assinatura</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Gerencie os dados de pagamento da sua conta, visualize histórico de
            faturas ou cancele sua assinatura.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-primary/40 animate-spin" />
            <p className="text-xs text-muted-foreground font-semibold">
              Carregando detalhes do faturamento...
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Subscription Status Card */}
            <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
              <CardHeader className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardDescription className="text-xs font-bold uppercase tracking-wider">
                      Plano Atual
                    </CardDescription>
                    <CardTitle className="text-xl sm:text-2xl font-black text-foreground capitalize flex items-center gap-2">
                      <span>Plano {planTier}</span>
                      <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-none font-bold text-[9px] uppercase">
                        {isFree ? "Gratuito" : "Ativo"}
                      </Badge>
                    </CardTitle>
                  </div>

                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                {isFree ? (
                  <p className="text-xs text-muted-foreground font-semibold leading-relaxed max-w-lg">
                    Você está utilizando a versão gratuita do PlanejaAI. Você
                    possui um limite de até 3 planos de aulas por mês com marcas
                    d&apos;água nos PDFs gerados. Faça o upgrade para remover os
                    limites e liberar a exportação de atividades práticas.
                  </p>
                ) : (
                  <div className="space-y-3 font-semibold text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        Próxima renovação em:{" "}
                        <span className="text-primary font-bold">
                          {nextBillingDate}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>
                        Faturamento seguro processado diretamente pela Stripe.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4 flex items-center justify-between">
                {isFree ? (
                  <a href="/pricing" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white font-bold h-10 px-5 rounded-xl shadow-lg shadow-primary/10 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>Fazer Upgrade para Pro</span>
                    </Button>
                  </a>
                ) : (
                  <Button
                    onClick={handleManageBilling}
                    disabled={isRedirecting}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white font-bold h-10 px-5 rounded-xl shadow-lg shadow-primary/10 flex items-center gap-2"
                  >
                    {isRedirecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    <span>Gerenciar Minha Assinatura</span>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

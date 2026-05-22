"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { Sidebar } from "@/components/layout/sidebar";
import { UpgradeButton } from "@/components/planner/upgrade-button";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Clock,
  ArrowRight,
  School,
  User,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  const { planTier, isLimitReached, isLoading } = useSubscription();

  const pricePro =
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_1ProMonthly";
  const priceEscola =
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ESCOLA || "price_1EscolaMonthly";

  const plans = [
    {
      tier: "free",
      name: "Gratuito",
      price: "R$ 0",
      description: "Ideal para experimentar a IA na elaboracao de aulas",
      icon: User,
      color: "border-border hover:border-border/80 bg-card/40",
      accent: "text-muted-foreground",
      features: [
        "Ate 3 planos de aula por mes",
        "Alinhamento BNCC basico",
        "Marca d'agua nos PDFs gerados",
        "Historico de 30 dias",
      ],
      notIncluded: [
        "Gerador de Atividades PDF",
        "Sem marcas d'agua",
        "Edicao de cronogramas salvos",
        "Painel gestor escolar",
      ],
    },
    {
      tier: "pro",
      name: "Pro",
      price: "R$ 29",
      period: "/mês",
      description: "Perfeito para professores dedicados ao ensino ativo",
      icon: Sparkles,
      color:
        "border-primary bg-primary/5 hover:bg-primary/10 shadow-lg shadow-primary/5 scale-105 sm:scale-105 z-10",
      accent: "text-primary",
      badge: "Mais Popular",
      features: [
        "Planos de aula ilimitados",
        "Sem marcas d'agua nos PDFs",
        "Gerador de Atividades PDF integrado",
        "Historico e reabertura ilimitados",
        "Adaptacao inclusiva avançada",
      ],
      notIncluded: [
        "Painel gestor de escola",
        "Gestao de licenças para equipes",
      ],
    },
    {
      tier: "escola",
      name: "Escola",
      price: "R$ 99",
      period: "/mês",
      description: "Para coordenacoes e equipes pedagógicas completas",
      icon: School,
      color:
        "border-secondary bg-secondary/5 hover:bg-secondary/10 shadow-lg shadow-secondary/5",
      accent: "text-secondary",
      badge: "Gestao",
      features: [
        "Ate 5 contas de professoras inclusas",
        "Painel gestor unificado",
        "Compartilhamento de planos entre a equipe",
        "Suporte prioritario e onboarding",
        "Todas as vantagens do plano Pro",
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-grow p-4 sm:p-8 overflow-y-auto space-y-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500 pb-16">
        {/* Page Headings */}
        <div className="text-center space-y-2 pt-4">
          <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-none font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full">
            Planos & Assinaturas
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Escolha o plano ideal para você
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto font-medium">
            Potencialize suas preparacoes de aulas com ferramentas avancadas de
            IA e gere atividades prontas para impressao.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-3 pt-6 items-stretch">
          {plans.map((p) => {
            const Icon = p.icon;
            const isCurrent = planTier === p.tier;
            return (
              <Card
                key={p.tier}
                className={`border-2 hover:shadow-xl transition-all rounded-3xl flex flex-col justify-between overflow-hidden relative p-6 ${p.color}`}
              >
                {p.badge && (
                  <Badge className="absolute top-4 right-4 bg-primary text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md">
                    {p.badge}
                  </Badge>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl bg-card border border-border/80 ${p.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl font-extrabold text-foreground">
                      {p.name}
                    </CardTitle>
                  </div>

                  <CardDescription className="text-xs font-semibold leading-relaxed min-h-[40px]">
                    {p.description}
                  </CardDescription>

                  <div className="pt-2">
                    <span className="text-3xl sm:text-4xl font-black text-foreground">
                      {p.price}
                    </span>
                    {p.period && (
                      <span className="text-sm text-muted-foreground font-semibold">
                        {p.period}
                      </span>
                    )}
                  </div>

                  <hr className="border-border/60" />

                  {/* Features Checklist */}
                  <ul className="space-y-2.5 text-xs font-semibold">
                    {p.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-foreground"
                      >
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                    {p.notIncluded.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-muted-foreground/60"
                      >
                        <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <Button
                      disabled
                      className="w-full bg-muted text-muted-foreground font-bold h-11 rounded-xl border border-border"
                    >
                      Seu Plano Atual
                    </Button>
                  ) : p.tier === "free" ? (
                    <Button
                      variant="outline"
                      className="w-full font-bold h-11 rounded-xl border-border hover:border-primary/20 hover:text-primary"
                      onClick={() => (window.location.href = "/planner")}
                    >
                      Usar Gratis
                    </Button>
                  ) : (
                    <UpgradeButton
                      priceId={p.tier === "pro" ? pricePro : priceEscola}
                      planTier={p.tier as "pro" | "escola"}
                    >
                      Assinar {p.name}
                    </UpgradeButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ Comparison Header */}
        <div className="pt-8 text-center">
          <h2 className="text-xl font-extrabold text-foreground flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Seguranca e Termos de Assinatura</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed font-semibold">
            Suas transacoes sao processadas de forma segura via Stripe. Cancele
            ou altere seu plano a qualquer momento no seu painel de faturamento.
          </p>
        </div>
      </div>
    </div>
  );
}
